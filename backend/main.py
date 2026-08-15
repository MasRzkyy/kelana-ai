from fastapi import FastAPI
from pydantic import BaseModel

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_places,
)

app = FastAPI(
    title="KelanaAI",
    description="AI-powered travel recommendation service",
    version="1.0.0",
)

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_month: str = "January"
    travel_style: str = ""



def get_recommended_transport(travel_style: str) -> str:
    style_map = {
        "family":    "Train",
        "solo":      "Bus",
        "couple":    "Flight",
        "business":  "Flight",
        "backpacker":"Bus",
    }
    return style_map.get(travel_style.strip().lower(), "Train")


@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}

@app.get("/health")
def health_check():
    return {"status": "OK"}


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget           = calculate_daily_budget(request.budget, request.days)
    category               = get_trip_category(request.budget)
    season                 = get_travel_season(request.travel_month)
    places                 = get_recommended_places(request.destination)
    recommended_transport  = get_recommended_transport(request.travel_style)

    return {
        "destination":            request.destination,
        "days":                   request.days,
        "budget":                 request.budget,
        "daily_budget":           round(daily_budget, 2),
        "category":               category,
        "travel_month":           request.travel_month,
        "season":                 season,
        "recommended_places":     places,
        "recommended_transport":  recommended_transport,
    }


@app.get("/api/v1/trip-categories")
def list_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]

@app.get("/api/v1/recommendations")
def list_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]

@app.get("/api/v1/transportations")
def list_transportations():
    return ["Bus", "Train", "Flight"]
