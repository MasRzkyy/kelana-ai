import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus

# Load .env so os.getenv() can read DATABASE_URL
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/kelana_ai")

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("[Database] Connected successfully to PostgreSQL!")
except Exception as e:
    if isinstance(e, UnicodeDecodeError):
        err_msg = e.object.decode("cp1252", errors="replace").strip()
    else:
        err_msg = str(e).strip()
    print(f"[Database Warning] Gagal terhubung ke PostgreSQL: {err_msg}")
    DATABASE_URL = "sqlite:///./kelana_ai.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    import models.trip
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS ai_recommendation TEXT;"))
            conn.commit()
    except Exception as e:
        print(f"[Database Warning] Auto-migration check: {e}")

