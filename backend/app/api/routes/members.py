from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
from app.database.session import get_db
import app.models as models
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/members", tags=["Members Management"])

@router.get("")
def list_members(
    db: Session = Depends(get_db),
    query: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.Member)
    if query:
        pattern = f"%{query}%"
        q = q.filter(
            or_(
                models.Member.full_name.ilike(pattern),
                models.Member.membership_number.ilike(pattern),
                models.Member.email.ilike(pattern),
                models.Member.phone.ilike(pattern),
                models.Member.department.ilike(pattern),
            )
        )
    if status_filter:
        q = q.filter(models.Member.status == status_filter)

    total = q.count()
    members = q.order_by(models.Member.id.asc()).offset(skip).limit(limit).all()

    results = []
    for m in members:
        active_loans = sum(1 for loan in m.loans if loan.status in ["Issued", "Overdue"])
        results.append({
            "id": m.id,
            "membership_number": m.membership_number,
            "full_name": m.full_name,
            "email": m.email,
            "phone": m.phone,
            "department": m.department,
            "membership_type": m.membership_type,
            "status": m.status,
            "outstanding_fine": m.outstanding_fine,
            "active_loans_count": active_loans,
            "registration_date": m.registration_date.isoformat() if m.registration_date else None,
            "expiry_date": m.expiry_date.isoformat() if m.expiry_date else None,
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": results,
    }

@router.get("/{member_id}")
def get_member(member_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")

    loans = []
    for l in m.loans:
        item = l.item
        book = item.book if item else None
        loans.append({
            "id": l.id,
            "loan_number": l.loan_number,
            "book_title": book.title if book else "Unknown",
            "accession_number": item.accession_number if item else "Unknown",
            "issue_date": l.issue_date.isoformat() if l.issue_date else None,
            "due_date": l.due_date.isoformat() if l.due_date else None,
            "return_date": l.return_date.isoformat() if l.return_date else None,
            "status": l.status,
            "renewal_count": l.renewal_count,
        })

    fines = []
    for f in m.fines:
        fines.append({
            "id": f.id,
            "loan_id": f.loan_id,
            "amount": f.amount,
            "paid_amount": f.paid_amount,
            "status": f.status,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        })

    return {
        "id": m.id,
        "membership_number": m.membership_number,
        "full_name": m.full_name,
        "email": m.email,
        "phone": m.phone,
        "department": m.department,
        "membership_type": m.membership_type,
        "status": m.status,
        "outstanding_fine": m.outstanding_fine,
        "registration_date": m.registration_date.isoformat() if m.registration_date else None,
        "expiry_date": m.expiry_date.isoformat() if m.expiry_date else None,
        "loans": loans,
        "fines": fines,
    }

@router.post("")
def register_member(
    member_in: schemas.MemberCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Member).filter_by(email=member_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Member with this email already registered")

    count = db.query(models.Member).count() + 1
    mem_num = f"MEM-2026-{count:04d}"

    new_member = models.Member(
        membership_number=mem_num,
        full_name=member_in.full_name,
        email=member_in.email,
        phone=member_in.phone,
        department=member_in.department,
        membership_type=member_in.membership_type,
        registration_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=365),
        status=member_in.status,
        outstanding_fine=0.0
    )
    db.add(new_member)
    db.flush()

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="MEMBER_REGISTER",
        resource="Member",
        resource_id=new_member.membership_number,
        details=f"Registered member '{new_member.full_name}' ({new_member.membership_type})"
    ))

    db.commit()
    db.refresh(new_member)

    return {
        "id": new_member.id,
        "membership_number": new_member.membership_number,
        "full_name": new_member.full_name,
        "status": new_member.status,
        "message": "Member registered successfully"
    }

@router.patch("/{member_id}/status")
def toggle_status(
    member_id: int,
    status_val: str = Query(..., regex="^(Active|Blocked|Expired)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    
    old_status = m.status
    m.status = status_val
    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="MEMBER_STATUS_CHANGE",
        resource="Member",
        resource_id=m.membership_number,
        details=f"Changed status from {old_status} to {status_val}"
    ))
    db.commit()
    return {"message": f"Member status updated to {status_val}", "status": status_val}

@router.post("/{member_id}/pay-fines")
def pay_fines(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    
    paid_amt = m.outstanding_fine
    m.outstanding_fine = 0.0
    for f in m.fines:
        if f.status == "Pending":
            f.status = "Paid"
            f.paid_amount = f.amount
            f.paid_at = datetime.utcnow()

    # If member was blocked solely due to fines, unblock
    if m.status == "Blocked":
        m.status = "Active"

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="FINE_SETTLED",
        resource="Member",
        resource_id=m.membership_number,
        details=f"Paid all pending fines total ${paid_amt:.2f}. Status set to {m.status}."
    ))
    db.commit()
    return {"message": f"Successfully settled fines of ${paid_amt:.2f}", "outstanding_fine": 0.0, "status": m.status}
