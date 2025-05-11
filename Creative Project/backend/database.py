# database.py
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from backend.models import Base

# PostgreSQL connection string
DATABASE_URL = "postgresql://postgres:05231344@localhost:5432/FinanceApp"

try:
    # Try to connect to PostgreSQL
    engine = create_engine(DATABASE_URL)
    # Test the connection
    engine.connect()
    print("Connected to PostgreSQL database!")
except Exception as e:
    # If PostgreSQL connection fails, raise an error
    error_message = f"PostgreSQL connection failed: {e}"
    print(error_message)
    raise Exception(f"Unable to connect to PostgreSQL database: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)
