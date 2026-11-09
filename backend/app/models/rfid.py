from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class RFIDTag(Base):
    __tablename__ = "rfid_tags"

    id = Column(Integer, primary_key=True, index=True)
    tag_uid = Column(String(64), unique=True, nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("book_items.id", ondelete="SET NULL"), unique=True, nullable=True)
    tag_type = Column(String(50), default="HF 13.56 MHz ISO 15693")
    security_bit = Column(Integer, default=1)  # 1 = Armed (In library), 0 = Cleared (Issued)
    registration_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, RETIRED, DAMAGED

    item = relationship("BookItem", back_populates="rfid_tag")


class InventorySession(Base):
    __tablename__ = "inventory_sessions"

    id = Column(Integer, primary_key=True, index=True)
    shelf_location = Column(String(100), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, CANCELLED
    total_expected = Column(Integer, default=0)
    total_found = Column(Integer, default=0)
    total_missing = Column(Integer, default=0)
    total_misplaced = Column(Integer, default=0)

    scans = relationship("InventoryScan", back_populates="session", cascade="all, delete-orphan")


class InventoryScan(Base):
    __tablename__ = "inventory_scans"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("inventory_sessions.id", ondelete="CASCADE"), nullable=False)
    tag_uid = Column(String(64), nullable=False)
    item_id = Column(Integer, nullable=True)
    scan_result = Column(String(30), nullable=False)  # FOUND, MISPLACED, UNEXPECTED, MISSING
    scanned_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InventorySession", back_populates="scans")


class GateEvent(Base):
    __tablename__ = "gate_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), unique=True, nullable=False, index=True)
    tag_uid = Column(String(64), nullable=False, index=True)
    accession_number = Column(String(64), nullable=True)
    item_id = Column(Integer, ForeignKey("book_items.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    gate_location = Column(String(100), default="Main Foyer Gate #1")
    event_type = Column(String(30), default="EGRESS_SCAN")
    auth_result = Column(String(20), nullable=False)  # AUTHORIZED, UNAUTHORIZED
    alarm_status = Column(String(20), nullable=False)  # QUIET, TRIGGERED
    security_bit = Column(Integer, default=1)
    cctv_reference = Column(String(255), nullable=True)
    notification_status = Column(String(20), default="NOT_REQUIRED")  # NOT_REQUIRED, QUEUED, SENT

    item = relationship("BookItem", back_populates="gate_events")
