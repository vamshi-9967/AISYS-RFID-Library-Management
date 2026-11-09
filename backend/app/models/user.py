from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # ADMIN, LIBRARIAN, ASSISTANT, VIEWER
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", back_populates="role", cascade="all, delete-orphan")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    resource = Column(String(50), nullable=False)  # books, members, circulation, rfid, reports, settings
    action = Column(String(50), nullable=False)    # create, read, update, delete, execute

    role = relationship("Role", back_populates="permissions")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    role = relationship("Role", back_populates="users")
    smart_cards = relationship("SmartCard", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class SmartCard(Base):
    __tablename__ = "smart_cards"

    id = Column(Integer, primary_key=True, index=True)
    card_uid = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    issued_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, REVOKED, LOST

    user = relationship("User", back_populates="smart_cards")
