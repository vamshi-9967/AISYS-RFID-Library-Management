from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.session import get_db
import app.models as models
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/circulation", tags=["Circulation Operations"])

LOAN_DAYS = 14
MAX_FINES_THRESHOLD = 50.0
DAILY_FINE_RATE = 1.50
MAX_BORROW_STUDENT = 5
MAX_BORROW_FACULTY = 10

@router.get("/loans")
def list_loans(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    member_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.Loan)
    if status_filter:
        q = q.filter(models.Loan.status == status_filter)
    if member_id:
        q = q.filter(models.Loan.member_id == member_id)

    total = q.count()
    loans = q.order_by(models.Loan.issue_date.desc()).offset(skip).limit(limit).all()

    results = []
    now = datetime.utcnow()
    for l in loans:
        # Check dynamic overdue status
        current_status = l.status
        if current_status == "Issued" and l.due_date and l.due_date < now:
            current_status = "Overdue"

        item = l.item
        book = item.book if item else None
        results.append({
            "id": l.id,
            "loan_number": l.loan_number,
            "member_id": l.member_id,
            "member_name": l.member.full_name if l.member else "Unknown Member",
            "membership_number": l.member.membership_number if l.member else "",
            "item_id": l.item_id,
            "accession_number": item.accession_number if item else "Unknown",
            "barcode": item.barcode if item else "",
            "book_title": book.title if book else "Unknown Title",
            "issue_date": l.issue_date.isoformat() if l.issue_date else None,
            "due_date": l.due_date.isoformat() if l.due_date else None,
            "return_date": l.return_date.isoformat() if l.return_date else None,
            "renewal_count": l.renewal_count,
            "status": current_status,
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": results,
    }

@router.post("/issue")
def issue_book(
    req: schemas.IssueBookRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Resolve Member
    member = None
    if req.member_id:
        member = db.query(models.Member).filter_by(id=req.member_id).first()
    elif req.membership_number:
        member = db.query(models.Member).filter_by(membership_number=req.membership_number).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member could not be found")

    # 2. Policy Check: Member status
    if member.status == "Blocked":
        raise HTTPException(status_code=400, detail=f"Member '{member.full_name}' is BLOCKED. Resolve outstanding fines or administrative holds before borrowing.")
    if member.status == "Expired":
        raise HTTPException(status_code=400, detail=f"Member membership has EXPIRED ({member.expiry_date.strftime('%Y-%m-%d')}). Please renew membership.")

    # 3. Policy Check: Fine threshold
    if member.outstanding_fine > MAX_FINES_THRESHOLD:
        raise HTTPException(status_code=400, detail=f"Member outstanding fines (${member.outstanding_fine:.2f}) exceed maximum threshold (${MAX_FINES_THRESHOLD:.2f}). Issue blocked.")

    # 4. Policy Check: Borrowing capacity
    active_loans_count = db.query(models.Loan).filter(
        models.Loan.member_id == member.id,
        models.Loan.status.in_(["Issued", "Overdue"])
    ).count()

    max_limit = MAX_BORROW_FACULTY if member.membership_type.lower() == "faculty" else MAX_BORROW_STUDENT
    if active_loans_count >= max_limit:
        raise HTTPException(status_code=400, detail=f"Borrowing limit reached ({active_loans_count}/{max_limit} books). Patron must return a book before borrowing another.")

    # 5. Resolve Book Item
    item = None
    if req.item_id:
        item = db.query(models.BookItem).filter_by(id=req.item_id).first()
    elif req.accession_number:
        item = db.query(models.BookItem).filter_by(accession_number=req.accession_number).first()
    elif req.barcode:
        item = db.query(models.BookItem).filter_by(barcode=req.barcode).first()
    elif req.tag_uid:
        tag = db.query(models.RFIDTag).filter_by(tag_uid=req.tag_uid).first()
        if tag:
            item = tag.item

    if not item:
        raise HTTPException(status_code=404, detail="Book copy / item not found")

    # 6. Policy Check: Item availability & reference restriction
    if item.status != "Available":
        raise HTTPException(status_code=400, detail=f"Book copy '{item.accession_number}' is not available (Current status: {item.status}).")

    if item.book and item.book.is_reference:
        raise HTTPException(status_code=400, detail=f"Book '{item.book.title}' is classified as REFERENCE ONLY and cannot be checked out.")

    # 7. Execute Issue
    now = datetime.utcnow()
    due_date = now + timedelta(days=LOAN_DAYS)
    loan_count = db.query(models.Loan).count() + 1
    loan_number = f"LN-2026-{loan_count:05d}"

    loan = models.Loan(
        loan_number=loan_number,
        member_id=member.id,
        item_id=item.id,
        issue_date=now,
        due_date=due_date,
        renewal_count=0,
        status="Issued"
    )
    item.status = "Issued"

    # 8. Clear RFID Tag Security Bit (Disarm tag for patron egress)
    if item.rfid_tag:
        item.rfid_tag.security_bit = 0 # Disarmed!

    db.add(loan)
    db.flush()

    # 9. Audit Log
    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="LOAN_ISSUE",
        resource="Loan",
        resource_id=loan.loan_number,
        details=f"Issued '{item.book.title}' ({item.accession_number}) to {member.full_name} ({member.membership_number}). Due date: {due_date.strftime('%Y-%m-%d')}. RFID security bit DISARMED."
    ))

    db.commit()

    return {
        "success": True,
        "loan_number": loan.loan_number,
        "member_name": member.full_name,
        "book_title": item.book.title if item.book else "Unknown",
        "accession_number": item.accession_number,
        "issue_date": now.strftime("%Y-%m-%d %H:%M"),
        "due_date": due_date.strftime("%Y-%m-%d"),
        "security_bit": 0,
        "message": f"Successfully issued '{item.book.title}' to {member.full_name}. Due on {due_date.strftime('%d %b %Y')}."
    }

@router.post("/return")
def return_book(
    req: schemas.ReturnBookRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Resolve item
    item = None
    if req.item_id:
        item = db.query(models.BookItem).filter_by(id=req.item_id).first()
    elif req.accession_number:
        item = db.query(models.BookItem).filter_by(accession_number=req.accession_number).first()
    elif req.barcode:
        item = db.query(models.BookItem).filter_by(barcode=req.barcode).first()
    elif req.tag_uid:
        tag = db.query(models.RFIDTag).filter_by(tag_uid=req.tag_uid).first()
        if tag:
            item = tag.item

    if not item:
        raise HTTPException(status_code=404, detail="Book item not found")

    # Find active loan
    loan = db.query(models.Loan).filter(
        models.Loan.item_id == item.id,
        models.Loan.status.in_(["Issued", "Overdue"])
    ).first()

    if not loan:
        raise HTTPException(status_code=400, detail=f"No active loan record found for book copy '{item.accession_number}'. Item status is already '{item.status}'.")

    now = datetime.utcnow()
    fine_amount = 0.0

    # Check overdue
    if loan.due_date and now > loan.due_date:
        days_overdue = (now - loan.due_date).days
        if days_overdue > 0:
            fine_amount = days_overdue * DAILY_FINE_RATE
            fine = models.Fine(
                loan_id=loan.id,
                member_id=loan.member_id,
                amount=fine_amount,
                status="Pending"
            )
            db.add(fine)
            if loan.member:
                loan.member.outstanding_fine += fine_amount
                if loan.member.outstanding_fine > MAX_FINES_THRESHOLD:
                    loan.member.status = "Blocked"

    loan.return_date = now
    loan.status = "Returned"
    item.status = "Available"

    # Re-arm RFID Tag security bit to 1
    if item.rfid_tag:
        item.rfid_tag.security_bit = 1 # Re-armed!

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="LOAN_RETURN",
        resource="Loan",
        resource_id=loan.loan_number,
        details=f"Returned '{item.book.title}' ({item.accession_number}). Overdue fine assessed: ${fine_amount:.2f}. RFID security bit RE-ARMED."
    ))

    db.commit()

    return {
        "success": True,
        "loan_number": loan.loan_number,
        "book_title": item.book.title if item.book else "Unknown",
        "accession_number": item.accession_number,
        "return_date": now.strftime("%Y-%m-%d %H:%M"),
        "fine_amount": fine_amount,
        "security_bit": 1,
        "message": f"Successfully returned '{item.book.title}'. RFID tag re-armed with active security protection." + (f" Overdue fine: ${fine_amount:.2f}" if fine_amount > 0 else "")
    }

@router.post("/renew")
def renew_book(
    req: schemas.RenewBookRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    loan = db.query(models.Loan).filter_by(id=req.loan_id).first()
    if not loan or loan.status not in ["Issued", "Overdue"]:
        raise HTTPException(status_code=404, detail="Active loan not found")

    if loan.renewal_count >= 2:
        raise HTTPException(status_code=400, detail="Maximum renewal limit (2 renewals) reached for this loan.")

    now = datetime.utcnow()
    if loan.due_date and loan.due_date < now:
        raise HTTPException(status_code=400, detail="Cannot renew an overdue book. Please return the book and settle overdue fines.")

    loan.due_date = loan.due_date + timedelta(days=LOAN_DAYS)
    loan.renewal_count += 1

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="LOAN_RENEWAL",
        resource="Loan",
        resource_id=loan.loan_number,
        details=f"Renewed loan {loan.loan_number}. New due date: {loan.due_date.strftime('%Y-%m-%d')}"
    ))

    db.commit()

    return {
        "success": True,
        "loan_number": loan.loan_number,
        "new_due_date": loan.due_date.strftime("%Y-%m-%d"),
        "renewal_count": loan.renewal_count,
        "message": f"Loan renewed successfully. New due date is {loan.due_date.strftime('%d %b %Y')}."
    }

@router.get("/fines")
def list_fines(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    q = db.query(models.Fine)
    if status_filter:
        q = q.filter(models.Fine.status == status_filter)
    
    total = q.count()
    fines = q.order_by(models.Fine.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for f in fines:
        results.append({
            "id": f.id,
            "loan_id": f.loan_id,
            "member_id": f.member_id,
            "member_name": f.member.full_name if f.member else "Unknown",
            "amount": f.amount,
            "paid_amount": f.paid_amount,
            "status": f.status,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "paid_at": f.paid_at.isoformat() if f.paid_at else None,
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": results,
    }
