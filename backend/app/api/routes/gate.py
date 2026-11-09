from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
import app.models as models
from app.api.deps import get_current_user

router = APIRouter(prefix="/gate", tags=["RFID Security Gates & Loss Prevention"])

@router.get("/events")
def list_gate_events(
    db: Session = Depends(get_db),
    alarm_only: bool = False,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.GateEvent)
    if alarm_only:
        q = q.filter(models.GateEvent.alarm_status == "TRIGGERED")

    total = q.count()
    events = q.order_by(models.GateEvent.timestamp.desc()).offset(skip).limit(limit).all()

    results = []
    for ev in events:
        item = ev.item
        book = item.book if item else None
        results.append({
            "id": ev.id,
            "event_id": ev.event_id,
            "tag_uid": ev.tag_uid,
            "accession_number": ev.accession_number,
            "book_title": book.title if book else "Unknown Catalog Item",
            "timestamp": ev.timestamp.isoformat() if ev.timestamp else None,
            "gate_location": ev.gate_location,
            "event_type": ev.event_type,
            "auth_result": ev.auth_result,
            "alarm_status": ev.alarm_status,
            "security_bit": ev.security_bit,
            "cctv_reference": ev.cctv_reference,
            "notification_status": ev.notification_status,
        })

    return {
        "total": total,
        "items": results,
    }

@router.get("/status")
def get_gate_status(db: Session = Depends(get_db)):
    recent_alarms = db.query(models.GateEvent).filter(
        models.GateEvent.alarm_status == "TRIGGERED"
    ).count()

    total_events = db.query(models.GateEvent).count()

    return {
        "gate_id": "GATE-MAIN-01",
        "location": "Central Campus Library - Main Entrance / Gate A",
        "hardware_status": "ONLINE",
        "antenna_channels": [
            {"antenna_id": 1, "status": "ACTIVE", "frequency_mhz": 915.25, "tx_power_dbm": 30.0},
            {"antenna_id": 2, "status": "ACTIVE", "frequency_mhz": 915.75, "tx_power_dbm": 30.0},
            {"antenna_id": 3, "status": "ACTIVE", "frequency_mhz": 916.25, "tx_power_dbm": 30.0},
            {"antenna_id": 4, "status": "ACTIVE", "frequency_mhz": 916.75, "tx_power_dbm": 30.0},
        ],
        "cctv_camera_status": "ONLINE (RTSP 1080p Stream Active)",
        "audible_siren_enabled": True,
        "strobe_light_enabled": True,
        "total_gate_events_logged": total_events,
        "active_unresolved_alarms": recent_alarms,
        "last_heartbeat": datetime.utcnow().isoformat(),
    }

@router.post("/clear-alarm")
def clear_alarm(
    event_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ev = db.query(models.GateEvent).filter_by(event_id=event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Gate event not found")

    ev.alarm_status = "RESOLVED"
    ev.notification_status = "ACKNOWLEDGED"

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="GATE_ALARM_RESOLVED",
        resource="GateEvent",
        resource_id=event_id,
        details=f"Alarm {event_id} acknowledged and cleared by security operator."
    ))
    db.commit()

    return {"message": f"Alarm {event_id} successfully marked as RESOLVED"}
