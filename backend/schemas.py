# schemas.py

from pydantic import BaseModel
from typing import Optional

# --- Login ---
class LoginRequest(BaseModel):
    user_id: str
    password: str

# --- Chat ---
class ChatRequest(BaseModel):
    prompt: str
    user: str # Dify APIで必須の項目

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# --- Evaluation ---
class EvaluationCreate(BaseModel):
    evaluator_name: str
    prompt: str
    rag_response: str
    dify_conversation_id: Optional[str] = None
    rating: str
    reason_category: Optional[str] = None
    reason_free_text: Optional[str] = None
    remarks: Optional[str] = None

class EvaluationResponse(BaseModel):
    evaluation_id: int
    evaluator_name: str

    class Config:
        from_attributes = True