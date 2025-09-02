# config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    dify_api_url: str
    dify_api_key: str
    app_user_id: str
    app_password: str
    evaluators: str
    frontend_url: str # ◀️ この行を追加

    class Config:
        env_file = ".env"

settings = Settings()