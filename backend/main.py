# main.py

import httpx
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 他の自作モジュールをインポート
import models
import schemas
import config
from database import engine, get_db

print("--- 1. main.py ファイルの読み込み開始 ---") 

# データベースにテーブルがなければ作成する
# この行は uvicorn がリロードするたびにチェックされる
models.Base.metadata.create_all(bind=engine)

# FastAPIアプリケーションの本体を作成
app = FastAPI()
print("--- 2. FastAPIアプリケーション作成完了 ---")

# config.py から設定を読み込む
settings = config.settings

# --- CORSミドルウェアの設定 ---
# 環境変数から許可するオリジン（フロントエンドURL）のリストを読み込む
# カンマ区切りで複数指定可能 (例: "http://localhost:5173,https://dify-eval-frontend...")
origins = [url.strip() for url in settings.frontend_url.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # 読み込んだリストを使用
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- APIエンドポイントの定義 ---
@app.get("/api/evaluators")
def get_evaluators():
    """ .envファイルから評価者リストを取得して返す """
    # カンマ区切りの文字列をリストに変換して返す
    evaluator_list = [name.strip() for name in settings.evaluators.split(',') if name.strip()]
    return {"evaluators": evaluator_list}


@app.post("/api/login", status_code=status.HTTP_200_OK)
def login(request: schemas.LoginRequest):
    """共通IDとパスワードでログイン認証を行う"""
    if request.user_id == settings.app_user_id and request.password == settings.app_password:
        return {"status": "success", "message": "Login successful"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect ID or password",
        )

print("--- 3. /api/chat ルートの定義を開始 ---")  #debug

@app.post("/api/chat", response_model=schemas.ChatResponse)
async def chat_with_dify(request: schemas.ChatRequest):
    """Difyのchat-messages APIと通信する"""
    headers = {
        "Authorization": f"Bearer {settings.dify_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": {},
        "query": request.prompt,
        "response_mode": "streaming",
        "user": request.user,
        "conversation_id": "" # 毎回新しい会話を開始
    }

    async with httpx.AsyncClient() as client:
        try:
            # Dify APIへストリーミングリクエストを送信
            async with client.stream("POST", f"{settings.dify_api_url.rstrip('/')}/chat-messages", json=payload, headers=headers, timeout=60.0) as response:
                response.raise_for_status()

                full_response = ""
                conversation_id = ""
                
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        import json
                        try:
                            data_str = line[len("data: "):]
                            if data_str:
                                data = json.loads(data_str)
                                
                                # ドキュメントに基づき、eventが'message'のものを探す
                                if data.get("event") == "message":
                                    full_response += data.get("answer", "")
                                
                                # どのイベントでもconversation_idが含まれていれば取得する
                                if data.get("conversation_id"):
                                    conversation_id = data["conversation_id"]

                        except json.JSONDecodeError:
                            continue # 空のdata行などを無視
            
            return schemas.ChatResponse(response=full_response, conversation_id=conversation_id)

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Dify API error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")



@app.post("/api/evaluations", response_model=schemas.EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(evaluation: schemas.EvaluationCreate, db: Session = Depends(get_db)):
    """評価結果をデータベースに保存する"""
    db_evaluation = models.Evaluation(**evaluation.dict())
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation