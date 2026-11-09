from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
import app.models as models
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/rfid", tags=["RFID Middleware & Hardware Operations"])

@router.get("/tags")
def list_tags(
    db: Session = Depends(get_db),
    query: Optional[str] = None,
    security_bit: Optional[int] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.RFIDTag)
    if query:
        pattern = f"%{query}%"
        q = q.filter(models.RFIDTag.tag_uid.ilike(pattern))
    if security_bit is not None:
        q = q.filter(models.RFIDTag.security_bit == security_bit)
    if status_filter:
        q = q.filter(models.RFIDTag.status == status_filter)

    total = q.count()
    tags = q.order_by(models.RFIDTag.id.desc()).offset(skip).limit(limit).all()

    results = []
    for t in tags:
        item = t.item
        book = item.book if item else None
        results.append({
            "id": t.id,
            "tag_uid": t.tag_uid,
            "tag_type": t.tag_type,
            "security_bit": t.security_bit,
            "status": t.status,
            "registration_date": t.registration_date.isoformat() if t.registration_date else None,
            "item_id": t.item_id,
            "accession_number": item.accession_number if item else "Unassigned",
            "barcode": item.barcode if item else "",
            "shelf_location": item.shelf_location if item else "",
            "item_status": item.status if item else "Unknown",
            "book_title": book.title if book else "Unknown Title",
            "category": book.category.name if book and book.category else "General",
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": results,
    }

@router.post("/scan-single")
def scan_single_tag(
    tag_uid: Optional[str] = None,
    accession_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Simulates the Staff Desktop RFID Reader reading a tag placed on the pad."""
    tag = None
    if tag_uid:
        tag = db.query(models.RFIDTag).filter_by(tag_uid=tag_uid).first()
    elif accession_number:
        item = db.query(models.BookItem).filter_by(accession_number=accession_number).first()
        if item:
            tag = item.rfid_tag

    if not tag:
        raise HTTPException(status_code=404, detail="RFID tag not recognized in database catalog")

    item = tag.item
    book = item.book if item else None

    # Determine checkout details if issued
    loan = db.query(models.Loan).filter(
        models.Loan.item_id == item.id,
        models.Loan.status.in_(["Issued", "Overdue"])
    ).first()

    return {
        "tag_uid": tag.tag_uid,
        "tag_type": tag.tag_type,
        "security_bit": tag.security_bit,
        "security_status": "ARMED (Alarm triggers on gate exit)" if tag.security_bit == 1 else "DISARMED (Permitted for patron exit)",
        "status": tag.status,
        "accession_number": item.accession_number if item else None,
        "barcode": item.barcode if item else None,
        "shelf_location": item.shelf_location if item else None,
        "item_status": item.status if item else "Unknown",
        "book": {
            "id": book.id if book else None,
            "title": book.title if book else "Unknown",
            "isbn": book.isbn if book else None,
            "authors": [a.name for a in book.authors] if book else [],
            "category": book.category.name if book and book.category else None,
            "is_reference": book.is_reference if book else False,
        },
        "loan": {
            "loan_number": loan.loan_number,
            "member_name": loan.member.full_name if loan.member else "Unknown",
            "due_date": loan.due_date.strftime("%Y-%m-%d") if loan.due_date else None,
        } if loan else None,
        "reader_timestamp": datetime.utcnow().isoformat(),
        "hardware_model": "AISYS UHF-9000 Staff Workstation Pad (Emulated)",
    }

@router.post("/toggle-security")
def toggle_security_bit(
    tag_uid: str,
    bit: int = Query(..., ge=0, le=1),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tag = db.query(models.RFIDTag).filter_by(tag_uid=tag_uid).first()
    if not tag:
        raise HTTPException(status_code=404, detail="RFID Tag not found")

    old_bit = tag.security_bit
    tag.security_bit = bit

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="RFID_SECURITY_BIT_CHANGE",
        resource="RFIDTag",
        resource_id=tag.tag_uid,
        details=f"Changed security bit from {old_bit} to {bit}"
    ))
    db.commit()

    return {
        "tag_uid": tag.tag_uid,
        "previous_security_bit": old_bit,
        "current_security_bit": bit,
        "status": "ARMED" if bit == 1 else "DISARMED",
        "message": f"Tag {tag.tag_uid} security bit set to {bit} ({'ARMED' if bit == 1 else 'DISARMED'})"
    }

@router.post("/simulate-gate")
def simulate_gate_event(
    req: schemas.RFIDGateSimulateRequest,
    db: Session = Depends(get_db)
):
    """Simulates a patron carrying a tagged item through the RFID Security Gate."""
    tag = db.query(models.RFIDTag).filter_by(tag_uid=req.tag_uid).first()
    if not tag:
        # Unknown tag detected at gate
        event_count = db.query(models.GateEvent).count() + 1
        event_id = f"GATE-EV-{event_count:04d}"
        now = datetime.utcnow()
        gate_event = models.GateEvent(
            event_id=event_id,
            tag_uid=req.tag_uid,
            timestamp=now,
            gate_location=req.gate_location,
            event_type="EGRESS_SCAN",
            auth_result="UNAUTHORIZED",
            alarm_status="TRIGGERED",
            security_bit=1,
            cctv_reference=f"CCTV_GATE_{now.strftime('%Y%m%d_%H%M%S')}.jpg",
            notification_status="QUEUED"
        )
        db.add(gate_event)
        db.commit()
        return {
            "event_id": event_id,
            "alarm": True,
            "auth_result": "UNAUTHORIZED",
            "message": "ALARM TRIGGERED! Unregistered RFID tag detected passing security gate.",
            "gate_location": req.gate_location,
            "timestamp": now.isoformat(),
        }

    item = tag.item
    book = item.book if item else None
    now = datetime.utcnow()
    event_count = db.query(models.GateEvent).count() + 1
    event_id = f"GATE-EV-{event_count:04d}"

    # Check security bit
    if tag.security_bit == 1:
        # Stolen or unissued book!
        gate_event = models.GateEvent(
            event_id=event_id,
            tag_uid=tag.tag_uid,
            accession_number=item.accession_number if item else None,
            item_id=item.id if item else None,
            timestamp=now,
            gate_location=req.gate_location,
            event_type="EGRESS_SCAN",
            auth_result="UNAUTHORIZED",
            alarm_status="TRIGGERED",
            security_bit=1,
            cctv_reference=f"CCTV_GATE_{now.strftime('%Y%m%d_%H%M%S')}.jpg",
            notification_status="QUEUED"
        )
        db.add(gate_event)

        # Create alert notification
        db.add(models.Notification(
            recipient="librarian@aisys.local",
            type="GATE_ALERT",
            subject="SECURITY GATE BREACH: Unauthorized Item Egress",
            message=f"Unauthorized removal detected at {req.gate_location}: '{book.title if book else 'Unknown'}' (Accession: {item.accession_number if item else 'N/A'}, Tag: {tag.tag_uid}).",
            status="QUEUED"
        ))

        db.commit()

        return {
            "event_id": event_id,
            "alarm": True,
            "alarm_sound": "AUDIBLE_SIREN_TRIGGERED",
            "auth_result": "UNAUTHORIZED",
            "book_title": book.title if book else "Unknown",
            "accession_number": item.accession_number if item else "Unknown",
            "gate_location": req.gate_location,
            "cctv_reference": gate_event.cctv_reference,
            "timestamp": now.isoformat(),
            "message": f"🚨 SECURITY GATE ALARM TRIGGERED! Item '{book.title if book else 'Unknown'}' has not been checked out. Security bit is ARMED (1)."
        }
    else:
        # Permitted egress
        gate_event = models.GateEvent(
            event_id=event_id,
            tag_uid=tag.tag_uid,
            accession_number=item.accession_number if item else None,
            item_id=item.id if item else None,
            timestamp=now,
            gate_location=req.gate_location,
            event_type="EGRESS_SCAN",
            auth_result="AUTHORIZED",
            alarm_status="QUIET",
            security_bit=0,
            cctv_reference=f"CCTV_GATE_{now.strftime('%Y%m%d_%H%M%S')}.jpg",
            notification_status="NOT_REQUIRED"
        )
        db.add(gate_event)
        db.commit()

        return {
            "event_id": event_id,
            "alarm": False,
            "auth_result": "AUTHORIZED",
            "book_title": book.title if book else "Unknown",
            "accession_number": item.accession_number if item else "Unknown",
            "gate_location": req.gate_location,
            "timestamp": now.isoformat(),
            "message": f"✅ AUTHORIZED EXIT: Item '{book.title if book else 'Unknown'}' was properly checked out. Gate status: QUIET."
        }
