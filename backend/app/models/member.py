from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    membership_number = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    department = Column(String(100), nullable=False)
    membership_type = Column(String(30), default="Student")  # Student, Faculty, Researcher
    registration_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="Active")  # Active, Blocked, Expired
    outstanding_fine = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    loans = relationship("Loan", back_populates="member", cascade="all, delete-orphan")
    fines = relationship("Fine", back_populates="member", cascade="all, delete-orphan")
