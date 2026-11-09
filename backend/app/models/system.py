from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False, index=True)  # BOOK_ISSUE, BOOK_RETURN, SECURITY_GATE_ALARM, etc.
    resource = Column(String(50), nullable=False)            # Loan, Book, RFIDTag, Setting
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), default="EMAIL")  # EMAIL, SMS, GATE_ALERT
    recipient = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="QUEUED")  # QUEUED, SENT, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)


class MigrationJob(Base):
    __tablename__ = "migration_jobs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), unique=True, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    invalid_rows = Column(Integer, default=0)
    duplicate_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    status = Column(String(30), default="STAGED")  # STAGED, DRY_RUN_COMPLETED, IMPORTED, ROLLED_BACK
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    rows = relationship("MigrationRow", back_populates="job", cascade="all, delete-orphan")


class MigrationRow(Base):
    __tablename__ = "migration_rows"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("migration_jobs.id", ondelete="CASCADE"), nullable=False)
    row_number = Column(Integer, nullable=False)
    data_json = Column(Text, nullable=False)  # Raw row data serialized as JSON
    validation_errors = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING")  # PENDING, VALID, INVALID, DUPLICATE, IMPORTED

    job = relationship("MigrationJob", back_populates="rows")


class LibrarySetting(Base):
    __tablename__ = "library_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
