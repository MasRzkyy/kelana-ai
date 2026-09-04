from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, init_db
from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message
from schemas.trip import TripRequest, TripUpdate, TripResponse
from schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from schemas.kb import QuestionRequest, QuestionResponse
from schemas.conversation import (
    CreateConversationResponse,
    ConversationResponse,
    ConversationUpdate,
    SendMessageRequest,
    MessageResponse,
)
from typing import List
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_travel_season,
    get_recommended_places,
)
from services.bedrock_service import generate_trip_recommendation
from services.kb_service import ask_knowledge_base
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


# ── RAG Knowledge Base Endpoints (Session 09 - Part 6) ───────────────────────
@app.post("/api/v1/ask", response_model=QuestionResponse)
@app.post("/api/v1/assistant", response_model=QuestionResponse)
def ask_endpoint(request: QuestionRequest):
    """
    Send question to Amazon Bedrock Knowledge Base and return a grounded answer with source citations.
    """
    try:
        res = ask_knowledge_base(request.question)
        return QuestionResponse(
            question=request.question,
            answer=res["answer"],
            source=res.get("source"),
            citations=res.get("citations"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query Knowledge Base: {str(e)}"
        )


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


# ── Conversation Endpoints (Session 10 - Part 3) ──────────────────────────────
@app.post("/api/v1/conversations", response_model=CreateConversationResponse, status_code=201)
def create_conversation(user: User = Depends(get_current_user)):
    """Create a new conversation row for the authenticated user."""
    db = SessionLocal()
    try:
        conv = Conversation(user_id=user.id, title="New Conversation")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return CreateConversationResponse(conversation_id=conv.id)
    finally:
        db.close()


@app.get("/api/v1/conversations", response_model=List[ConversationResponse])
def list_conversations(user: User = Depends(get_current_user)):
    """List previous conversations for the authenticated user."""
    db = SessionLocal()
    try:
        convs = db.query(Conversation).filter(Conversation.user_id == user.id).order_by(Conversation.created_at.desc()).all()
        result = []
        for c in convs:
            title = c.title or "New Conversation"
            result.append(ConversationResponse(id=c.id, title=title, created_at=c.created_at))
        return result
    finally:
        db.close()


@app.patch("/api/v1/conversations/{id}", response_model=ConversationResponse)
def update_conversation(
    id: int,
    request: ConversationUpdate,
    user: User = Depends(get_current_user)
):
    """Bonus Challenge: Rename conversation title."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == id).first()
        if not conv:
            raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
        if conv.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this conversation")

        conv.title = request.title.strip()
        db.commit()
        db.refresh(conv)
        return ConversationResponse(id=conv.id, title=conv.title, created_at=conv.created_at)
    finally:
        db.close()


# ── Part 4: Send Message API (Orchestration) ──────────────────────────────────
@app.post("/api/v1/conversations/{id}/messages", response_model=MessageResponse, status_code=201)
def send_message(
    id: int,
    request: SendMessageRequest,
    user: User = Depends(get_current_user)
):
    """
    Session 10 - Part 4: Send Message API
    Orchestration steps:
      01: Receive User Message
      02: Save Message (role='user')
      03: Load Previous Messages
      04: Build Prompt
      05: Amazon Bedrock (ask_knowledge_base)
      06: Save AI Response (role='assistant')
      07: Return Response
    """
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == id).first()
        if not conv:
            raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
        if conv.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this conversation")

        # 01 & 02: Save User Message
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=request.content
        )
        db.add(user_msg)
        db.commit()

        # Update conversation title if default
        if not conv.title or conv.title == "New Conversation":
            conv.title = request.content[:50]
            db.commit()

        # 03: Load Previous Messages (prior to current message)
        previous_messages = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id, Message.id != user_msg.id)
            .order_by(Message.created_at.asc())
            .all()
        )

        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in previous_messages
        ]

        # 04 & 05: Build Prompt & Call Amazon Bedrock (Context-Aware Multi-turn)
        try:
            res = ask_knowledge_base(request.content, chat_history=chat_history)
            ai_content = res.get("answer", "Maaf, terjadi kesalahan saat menghubungi Knowledge Base.")
        except Exception as e:
            ai_content = f"Maaf, tidak dapat memproses permintaan: {str(e)}"

        # 06: Save AI Response
        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=ai_content,
            source=res.get("source") if isinstance(res, dict) else None
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)

        # 07: Return Response
        return ai_msg
    finally:
        db.close()


@app.get("/api/v1/conversations/{id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    id: int,
    user: User = Depends(get_current_user)
):
    """Retrieve all messages for a specific conversation."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == id).first()
        if not conv:
            raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
        if conv.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this conversation")

        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.asc())
            .all()
        )
        return messages
    finally:
        db.close()


@app.delete("/api/v1/conversations/{id}")
def delete_conversation(
    id: int,
    user: User = Depends(get_current_user)
):
    """Delete a specific conversation and all its messages from database."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == id).first()
        if not conv:
            raise HTTPException(status_code=404, detail=f"Conversation with id {id} not found")
        if conv.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this conversation")

        db.delete(conv)
        db.commit()
        return {"message": "Conversation deleted successfully", "id": id}
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
