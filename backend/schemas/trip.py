from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_month: str = "January"
    travel_style: str = ""

class TripUpdate(BaseModel):
    destination: Optional[str] = None
    days: Optional[int] = None
    budget: Optional[float] = None
    travel_month: Optional[str] = None
    travel_style: Optional[str] = None

class TripResponse(BaseModel):
    id: int
    destination: str
    days: int
    budget: float
    category: str
    daily_budget: float
    travel_month: Optional[str] = "January"
    travel_style: Optional[str] = ""
    season: Optional[str] = None
    recommended_places: Optional[List[str]] = None
    recommended_transport: Optional[str] = None
    ai_recommendation: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
