from pydantic import BaseModel, model_validator
from typing import Optional, List, Any


class QuestionRequest(BaseModel):
    question: str

    @model_validator(mode="before")
    @classmethod
    def validate_question_field(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Resolve alternative key names (query, text, prompt, message) if 'question' is not explicitly set
            q = (
                values.get("question")
                or values.get("query")
                or values.get("text")
                or values.get("prompt")
                or values.get("message")
            )
            if q is not None:
                values["question"] = str(q)
        return values


class QuestionResponse(BaseModel):
    question: str
    answer: str
    source: Optional[str] = None
    citations: Optional[List[str]] = None
