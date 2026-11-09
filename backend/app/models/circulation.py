from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_number = Column(String(50), unique=True, nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="RESTRICT"), nullable=False)
    item_id = Column(Integer, ForeignKey("book_items.id", ondelete="RESTRICT"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False, index=True)
    return_date = Column(DateTime, nullable=True)
    renewal_count = Column(Integer, default=0)
    status = Column(String(20), default="Issued", index=True)  # Issued, Returned, Overdue
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="loans")
    item = relationship("BookItem", back_populates="loans")
    fine = relationship("Fine", back_populates="loan", uselist=False)


class Fine(Base):
    __tablename__ = "fines"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    paid_amount = Column(Float, default=0.0)
    status = Column(String(20), default="Pending")  # Pending, Paid, Waived
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    loan = relationship("Loan", back_populates="fine")
    member = relationship("Member", back_populates="fines")
