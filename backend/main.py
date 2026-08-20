from fastapi import FastAPI, HTTPException
from database import SessionLocal, init_db
from models.trip import Trip
from schemas.trip import TripRequest, TripUpdate
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_places,
)

init_db()

app = FastAPI(
    title="KelanaAI",
    description="AI-powered travel recommendation service",
    version="1.0.0",
)


def get_recommended_transport(travel_style: str) -> str:
    style_map = {
        "family":    "Train",
        "solo":      "Bus",
        "couple":    "Flight",
        "business":  "Flight",
        "backpacker":"Bus",
    }
    return style_map.get((travel_style or "").strip().lower(), "Train")


@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    return {"status": "OK"}


@app.post("/api/v1/trips", status_code=201)
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)
    season       = get_travel_season(request.travel_month) if getattr(request, "travel_month", None) else None

    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
        travel_month = getattr(request, "travel_month", "January"),
        travel_style = getattr(request, "travel_style", ""),
        season       = season,
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    try:
        trips = db.query(Trip).all()
        return trips
    finally:
        db.close()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        return trip
    finally:
        db.close()


@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdate):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

        if request.destination is not None:
            trip.destination = request.destination
        if request.days is not None:
            trip.days = request.days
        if request.budget is not None:
            trip.budget = request.budget
        if request.travel_month is not None:
            trip.travel_month = request.travel_month
            trip.season = get_travel_season(request.travel_month)
        if request.travel_style is not None:
            trip.travel_style = request.travel_style

        trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
        trip.category     = get_trip_category(trip.budget)

        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} successfully deleted", "id": trip_id}
    finally:
        db.close()


@app.get("/api/v1/trip-categories")
def list_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]


@app.get("/api/v1/recommendations")
def list_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations")
def list_transportations():
    return ["Bus", "Train", "Flight"]
