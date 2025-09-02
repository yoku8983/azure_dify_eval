# database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# データベースエンジンを作成
engine = create_engine(settings.database_url)

# DBセッションを作成するための設定
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DBモデル（テーブル）を作成するためのベースクラス
Base = declarative_base()

# DBセッションを取得するための関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()