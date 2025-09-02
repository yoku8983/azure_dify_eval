# models.py

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    evaluation_id = Column(Integer, primary_key=True, index=True)
    evaluator_name = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    rag_response = Column(Text, nullable=False)
    dify_conversation_id = Column(String(255), nullable=True)
    rating = Column(String(50), nullable=False)
    reason_category = Column(String(255), nullable=True)
    reason_free_text = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())