from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, init_db
from models.trip import Trip
from models.user import User
from schemas.trip import TripRequest, TripUpdate, TripResponse
from schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_places,
)
from services.bedrock_service import generate_trip_recommendation
from services.auth_service import (
    register_user,
    login_user,
    get_current_user,
)

init_db()

app = FastAPI(
    title="KelanaAI",
    description="AI-powered travel recommendation service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    return {"status": "OK"}


# ── Auth Endpoints ────────────────────────────────────────────────────────────
@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
def register(request: UserRegister):
    db = SessionLocal()
    try:
        user = register_user(db, name=request.name, email=request.email, password=request.password)
        return user
    finally:
        db.close()


@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(request: UserLogin):
    db = SessionLocal()
    try:
        res = login_user(db, email=request.email, password=request.password)
        return res
    finally:
        db.close()


@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return user


# ── Protected Trip Endpoints (Strictly matching Part 6 Slide) ────────────────
@app.post("/api/v1/trips", status_code=201)
def create_trip(
    request: TripRequest,
    user: User = Depends(get_current_user)
):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        travel_style=getattr(request, "travel_style", ""),
        user_id=user.id,
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
def list_trips(user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return db.query(Trip).filter(Trip.user_id == user.id).all()
    finally:
        db.close()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this trip")
        return trip
    finally:
        db.close()


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripUpdate,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this trip")

        if request.destination is not None:
            trip.destination = request.destination
        if request.days is not None:
            trip.days = request.days
        if request.budget is not None:
            trip.budget = request.budget
        if request.travel_style is not None:
            trip.travel_style = request.travel_style

        trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
        trip.category = get_trip_category(trip.budget)

        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this trip")

        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} successfully deleted", "id": trip_id}
    finally:
        db.close()


@app.post("/api/v1/trips/{trip_id}/generate", response_model=TripResponse)
def generate_ai_recommendation(trip_id: int, user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        if trip.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this trip")

        ai_result = generate_trip_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            category=trip.category,
            travel_style=trip.travel_style or "",
        )

        trip.ai_recommendation = ai_result
        db.commit()
        db.refresh(trip)

        return trip
    finally:
        db.close()


# ── Metadata Auxiliary Endpoints ──────────────────────────────────────────────
@app.get("/api/v1/trip-categories")
def list_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]


@app.get("/api/v1/recommendations")
def list_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations")
def list_transportations():
    return ["Bus", "Train", "Flight"]
