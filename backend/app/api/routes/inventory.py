from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
import app.models as models
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/inventory", tags=["RFID Handheld Inventory Auditing"])

@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.InventorySession)
    total = q.count()
    sessions = q.order_by(models.InventorySession.started_at.desc()).offset(skip).limit(limit).all()

    results = []
    for s in sessions:
        results.append({
            "id": s.id,
            "shelf_location": s.shelf_location,
            "total_expected": s.total_expected,
            "total_found": s.total_found,
            "total_missing": s.total_missing,
            "total_misplaced": s.total_misplaced,
            "status": s.status,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        })

    return {
        "total": total,
        "items": results,
    }

@router.post("/scan-shelf")
def scan_shelf_audit(
    req: schemas.InventoryScanBatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Simulates handheld inventory RFID wand sweep across a library shelf location.
    Compares scanned tags against shelf catalog records to identify verified, missing, and misplaced items.
    """
    now = datetime.utcnow()

    # Expected items on this shelf
    expected_items = db.query(models.BookItem).filter(
        models.BookItem.shelf_location == req.shelf_location,
        models.BookItem.status == "Available"
    ).all()
    expected_map = {item.rfid_tag.tag_uid: item for item in expected_items if item.rfid_tag}

    verified_items = []
    misplaced_items = []
    unknown_tags = []
    scanned_set = set(req.scanned_tags)

    # Process all scanned tags
    for tag_uid in req.scanned_tags:
        tag = db.query(models.RFIDTag).filter_by(tag_uid=tag_uid).first()
        if not tag or not tag.item:
            unknown_tags.append({"tag_uid": tag_uid, "status": "UNKNOWN_TAG"})
            continue
        
        item = tag.item
        book = item.book
        if item.shelf_location == req.shelf_location:
            verified_items.append({
                "tag_uid": tag.tag_uid,
                "accession_number": item.accession_number,
                "item_id": item.id,
                "title": book.title if book else "Unknown",
                "shelf_location": item.shelf_location,
                "status": "FOUND"
            })
        else:
            misplaced_items.append({
                "tag_uid": tag.tag_uid,
                "accession_number": item.accession_number,
                "item_id": item.id,
                "title": book.title if book else "Unknown",
                "expected_shelf": item.shelf_location,
                "found_at_shelf": req.shelf_location,
                "status": "MISPLACED"
            })

    # Identify missing items
    missing_items = []
    for tag_uid, item in expected_map.items():
        if tag_uid not in scanned_set:
            book = item.book
            missing_items.append({
                "tag_uid": tag_uid,
                "accession_number": item.accession_number,
                "item_id": item.id,
                "title": book.title if book else "Unknown",
                "expected_shelf": item.shelf_location,
                "status": "MISSING"
            })

    # Persist audit session
    audit_session = models.InventorySession(
        shelf_location=req.shelf_location,
        total_expected=len(expected_items),
        total_found=len(verified_items),
        total_missing=len(missing_items),
        total_misplaced=len(misplaced_items),
        status="COMPLETED",
        started_at=now,
        completed_at=datetime.utcnow()
    )
    db.add(audit_session)
    db.flush()

    # Record individual scan results
    for v in verified_items:
        db.add(models.InventoryScan(
            session_id=audit_session.id,
            tag_uid=v["tag_uid"],
            item_id=v["item_id"],
            scan_result="FOUND"
        ))
    for m in misplaced_items:
        db.add(models.InventoryScan(
            session_id=audit_session.id,
            tag_uid=m["tag_uid"],
            item_id=m["item_id"],
            scan_result="MISPLACED"
        ))
    for miss in missing_items:
        db.add(models.InventoryScan(
            session_id=audit_session.id,
            tag_uid=miss["tag_uid"],
            item_id=miss["item_id"],
            scan_result="MISSING"
        ))

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="INVENTORY_AUDIT_COMPLETED",
        resource="InventorySession",
        resource_id=str(audit_session.id),
        details=f"Shelf {req.shelf_location}: {len(verified_items)} matched, {len(misplaced_items)} misplaced, {len(missing_items)} missing."
    ))

    db.commit()

    return {
        "session_id": audit_session.id,
        "shelf_location": req.shelf_location,
        "total_scanned": len(req.scanned_tags),
        "total_expected": len(expected_items),
        "matched_count": len(verified_items),
        "misplaced_count": len(misplaced_items),
        "missing_count": len(missing_items),
        "unknown_count": len(unknown_tags),
        "accuracy_rate": round((len(verified_items) / max(len(expected_items), 1)) * 100, 1),
        "verified_items": verified_items,
        "misplaced_items": misplaced_items,
        "missing_items": missing_items,
        "unknown_items": unknown_tags,
    }
