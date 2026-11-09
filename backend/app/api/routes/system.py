from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
import app.models as models
from app.api.deps import get_current_user

router = APIRouter(prefix="/system", tags=["System Management & Audit"])

@router.get("/settings")
def get_settings_list(db: Session = Depends(get_db)):
    settings = db.query(models.LibrarySetting).all()
    return [{"key": s.key, "value": s.value, "description": s.description} for s in settings]

@router.put("/settings")
def update_settings(
    settings_dict: Dict[str, str] = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    for k, v in settings_dict.items():
        s = db.query(models.LibrarySetting).filter_by(key=k).first()
        if s:
            s.value = str(v)
            s.updated_at = datetime.utcnow()
        else:
            db.add(models.LibrarySetting(key=k, value=str(v)))

    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="SETTINGS_UPDATE",
        resource="LibrarySetting",
        resource_id="CONFIG",
        details=f"Updated settings keys: {', '.join(settings_dict.keys())}"
    ))
    db.commit()

    return {"message": "Settings updated successfully"}

@router.get("/audit-logs")
def list_audit_logs(
    db: Session = Depends(get_db),
    action: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    q = db.query(models.AuditLog)
    if action:
        q = q.filter(models.AuditLog.action.ilike(f"%{action}%"))

    total = q.count()
    logs = q.order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "username": l.username,
            "action": l.action,
            "resource": l.resource,
            "resource_id": l.resource_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        })

    return {
        "total": total,
        "items": results,
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{
        "id": u.id,
        "username": u.username,
        "full_name": u.full_name,
        "email": u.email,
        "role": u.role.name if u.role else "USER",
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    } for u in users]
