from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CreateConversationResponse(BaseModel):
    conversation_id: int


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationUpdate(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
