# config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    dify_api_url: str
    dify_api_key: str
    app_user_id: str
    app_password: str
    # ↓ この行を追加
    evaluators: str

    class Config:
        env_file = ".env"

settings = Settings()