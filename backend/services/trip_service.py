from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.trip import Trip
from schemas.trip import TripRequest, TripUpdate


def get_trip_category(budget: float) -> str:
    """Determine category tier based on total trip budget."""
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month: str) -> str:
    """Determine travel season category based on month name/number."""
    month_map = {
        "1": "January",   "2": "February", "3": "March",
        "4": "April",     "5": "May",      "6": "June",
        "7": "July",      "8": "August",   "9": "September",
        "10": "October",  "11": "November", "12": "December",
    }

    month_name = month_map.get(month.strip(), month.strip()).capitalize()

    if month_name == "December":
        return "Peak Season"
    elif month_name == "June":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget: float, days: int) -> float:
    """Calculate daily budget allowance based on budget and duration."""
    if days <= 0:
        raise ValueError("Trip duration days must be greater than zero")
    return budget / days


def get_recommended_places(destination: str) -> list:
    """Get list of popular places based on destination key."""
    places_db = {
        "japan":     ["Tokyo Tower", "Shibuya", "Mount Fuji", "Kyoto Temples", "Osaka Castle"],
        "korea":     ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Jeju Island", "Myeongdong"],
        "paris":     ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Montmartre"],
        "bali":      ["Tanah Lot Temple", "Ubud Monkey Forest", "Kuta Beach", "Tegallalang Rice Terrace"],
        "london":    ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace"],
        "indonesia": ["Bali", "Borobudur", "Raja Ampat", "Labuan Bajo"],
    }

    key = destination.strip().lower()
    return places_db.get(key, ["City Center", "Local Market", "Cultural Museum", "Nature Park"])


# ── Database Service Logic ───────────────────────────────────────────────────

def create_user_trip(db: Session, user_id: int, request: TripRequest) -> Trip:
    """Business logic for creating a trip associated with a specific user."""
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        user_id=user_id,
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        travel_style=getattr(request, "travel_style", ""),
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def get_user_trips(db: Session, user_id: int) -> List[Trip]:
    """Business logic for retrieving all trips owned by a specific user."""
    return db.query(Trip).filter(Trip.user_id == user_id).all()


def get_user_trip_by_id(db: Session, user_id: int, trip_id: int) -> Trip:
    """Business logic for retrieving a single trip owned by a specific user."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip


def update_user_trip(db: Session, user_id: int, trip_id: int, request: TripUpdate) -> Trip:
    """Business logic for updating a specific user's trip."""
    trip = get_user_trip_by_id(db, user_id, trip_id)

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


def delete_user_trip(db: Session, user_id: int, trip_id: int) -> dict:
    """Business logic for deleting a specific user's trip."""
    trip = get_user_trip_by_id(db, user_id, trip_id)
    db.delete(trip)
    db.commit()
    return {"message": f"Trip with id {trip_id} successfully deleted", "id": trip_id}
