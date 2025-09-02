# Dify RAG アプリケーション評価ツール  
  
## 概要  
このプロジェクトは、Difyで構築されたRAG（Retrieval-Augmented Generation）チャットアプリケーションの回答品質を、複数人の評価者が効率的にテスト・評価するためのWebアプリケーションです。    
ユーザーからの質問（プロンプト）に対するDifyアプリの回答を画面に表示し、評価者はそれに対して多角的なフィードバック（Good/Bad、複数選択可能な理由、自由記述）を入力できます。入力された評価データは、分析のためにAzure SQL Databaseに一元的に保存されます。  
  
## ✨ 主な機能  
- 評価者管理  
  - ログイン時にプルダウンから評価者名を選択。メンバーリストは設定ファイルで管理。  
- 1問1答の評価フロー  
  - チャットは1回ごとに新しいセッションで開始され、前の会話コンテキストを引き継ぎません。  
  - 回答が生成されるとチャット機能は一時的に無効化され、評価の入力が促されます。  
  - 評価を「保存」した後に「新規チャットへ」ボタンを押すことで画面がリセットされ、次の評価に移れます。  
- 多角的な評価項目  
  - 回答に対する「有用」「有用でない」のラジオボタン評価。  
  - 評価理由を複数選択できるチェックボックス。  
  - 「その他」を選択した場合のみ入力可能になる自由記述欄。  
- セキュリティ  
  - アカウント連携不要の認証方式を採用。  
  - Azureへのデプロイ時にはIPアドレスによるアクセス制限を想定。  
  
## 🏛️ アーキテクチャ  
このアプリケーションは、フロントエンドとバックエンドが分離された構成になっています。  
  
アーキテクチャ概略:    
[ユーザー] → Frontend (React @ Vite) ↔ Backend (Python @ FastAPI) ↔ Azure SQL Database    
　　　　　　　　　　　　　↘ Dify API  
  
- リポジトリ構成（モノレポ形式）  
  - `backend/`: FastAPIアプリケーション  
  - `frontend/`: Reactアプリケーション  
  
## 🛠️ 技術スタック  
### バックエンド  
- 言語: Python 3.12  
- フレームワーク: FastAPI  
- データベース: Azure SQL Database  
- ORM: SQLAlchemy  
- HTTPクライアント: HTTPX  
- その他: Uvicorn, Pydantic, python-dotenv  
  
### フロントエンド  
- ライブラリ: React 18  
- ビルドツール: Vite  
- HTTPクライアント: axios  
- パッケージ管理: npm  
  
### デプロイ  
- プラットフォーム: Microsoft Azure  
- コンテナ技術: Docker  
- CI/CD: GitHub Actions  
- Azureサービス: Azure App Service for Containers, Azure Container Registry  
  
## 🚀 ローカルでの開発環境セットアップ  
  
### 前提条件  
- Git  
- Python 3.12  
- Node.js 20.19+（`nvm`での管理を推奨）  
- Docker  
- Azure CLI（デプロイ時に使用）  
  
### 1. リポジトリのクローン  
```bash  
git clone https://github.com/yoku8983/azure_dify_eval.git
cd azure_dify_eval  
```  
  
### 2. バックエンドのセットアップ  
```bash  
cd backend  
```  
  
- Python の仮想環境を作成し、有効化します（Unix / macOS）:  
```bash  
python -m venv venv  
source venv/bin/activate  
```  
Windows（PowerShell）の場合:  
```powershell  
python -m venv venv  
.\venv\Scripts\Activate.ps1  
```  
Windows（コマンドプロンプト）の場合:  
```bat  
python -m venv venv  
venv\Scripts\activate  
```  
  
- OS に必要な ODBC ドライバをインストールします（例）:  
```bash  
sudo apt-get update  
sudo apt-get install -y unixodbc-dev  
# Microsoft ODBC Driver 18 for SQL Server のインストール手順は公式ドキュメントを参照してください:  
# https://learn.microsoft.com/ja-jp/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server  
```  
  
- 必要な Python ライブラリをインストールします:  
```bash  
pip install -r requirements.txt  
```  
  
- `.env` ファイルを作成し、設定を記述します（下記「⚙️ 設定」参照）:  
```bash  
cp .env.example .env  
# もしくは手動で .env を作成して編集してください  
```  
  
### 3. フロントエンドのセットアップ  
```bash  
# ルートディレクトリから  
cd frontend  
npm install  
```  
  
### 4. アプリケーションの起動  
アプリケーションを実行するには、バックエンドとフロントエンドをそれぞれ別のターミナルで起動します。  
  
- ターミナル1（バックエンド）:  
```bash  
cd backend  
source venv/bin/activate   # Windows の場合は venv\Scripts\activate  
uvicorn main:app --reload --host 127.0.0.1 --port 8000  
```  
バックエンドは http://127.0.0.1:8000 で起動します。  
  
- ターミナル2（フロントエンド）:  
```bash  
cd frontend  
npm run dev  
```  
フロントエンドは http://localhost:5173/
（または表示される別のポート）で起動します。ブラウザでアクセスしてください。  
  
## ⚙️ 設定  
バックエンドの動作には、`backend/` ディレクトリ内に `.env` ファイルを作成し、以下の環境変数を設定する必要があります。  
  
```ini  
# .env.example - この内容をコピーして .env ファイルを作成してください  
  
# Azure SQL Database の接続文字列  
# 例:  
# mssql+pyodbc://<user>:<password>@<server>.database.windows.net/<database>?driver=ODBC+Driver+18+for+SQL+Server  
DATABASE_URL="mssql+pyodbc://<user>:<password>@<server>.database.windows.net/<database>?driver=ODBC+Driver+18+for+SQL+Server"  
  
# Dify API の情報  
DIFY_API_URL="https://api.dify.ai/v1"   # Dify SaaS 版の場合。Enterprise 版は自社の URL に変更  
DIFY_API_KEY="<your-dify-apikey>"  
  
# 評価アプリの共通ログイン情報（共有の簡易認証用）  
APP_USER_ID="<your-id>"  
APP_PASSWORD="<your-strong-shared-password>"  
  
# 評価者のメンバーリスト（カンマ区切り）  
EVALUATORS="山田太郎,佐藤花子,鈴木一郎,guest"  
```  
  
> 注意: `.env` ファイルは `.gitignore` に含め、リポジトリにはコミットしないでください。  
  
## 🚢 デプロイ  
このアプリケーションは Docker コンテナとして Azure にデプロイされることを想定しています。通常は GitHub リポジトリの `main` ブランチへのプッシュをトリガーに GitHub Actions でビルド・デプロイを自動化