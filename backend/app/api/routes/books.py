from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from app.database.session import get_db
import app.models as models
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/books", tags=["Books & Cataloguing"])

@router.get("")
def list_books(
    db: Session = Depends(get_db),
    query: Optional[str] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
):
    q = db.query(models.Book)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                models.Book.title.ilike(search_pattern),
                models.Book.isbn.ilike(search_pattern),
                models.Book.publisher.ilike(search_pattern),
            )
        )
    if category_id:
        q = q.filter(models.Book.category_id == category_id)

    total = q.count()
    books = q.order_by(models.Book.id.desc()).offset(skip).limit(limit).all()

    results = []
    for b in books:
        total_copies = len(b.items)
        available_copies = sum(1 for item in b.items if item.status == "Available")
        results.append({
            "id": b.id,
            "isbn": b.isbn,
            "title": b.title,
            "subtitle": b.subtitle,
            "publisher": b.publisher,
            "year": b.year,
            "language": b.language,
            "edition": b.edition,
            "description": b.description,
            "pages": b.pages,
            "cover_url": b.cover_url,
            "is_reference": b.is_reference,
            "category_id": b.category_id,
            "category": {"id": b.category.id, "name": b.category.name, "code": b.category.code} if b.category else None,
            "authors": [{"id": a.id, "name": a.name} for a in b.authors],
            "total_copies": total_copies,
            "available_copies": available_copies,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": results,
    }

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(models.Category).all()
    return [{"id": c.id, "name": c.name, "code": c.code, "description": c.description} for c in cats]

@router.get("/authors")
def get_authors(db: Session = Depends(get_db)):
    auths = db.query(models.Author).order_by(models.Author.name).all()
    return [{"id": a.id, "name": a.name, "biography": a.biography} for a in auths]

@router.get("/{book_id}")
def get_book_details(book_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Book not found")
    
    copies = []
    for item in b.items:
        tag_info = None
        if item.rfid_tag:
            tag_info = {
                "id": item.rfid_tag.id,
                "tag_uid": item.rfid_tag.tag_uid,
                "security_bit": item.rfid_tag.security_bit,
                "status": item.rfid_tag.status,
            }
        copies.append({
            "id": item.id,
            "accession_number": item.accession_number,
            "barcode": item.barcode,
            "shelf_location": item.shelf_location,
            "status": item.status,
            "acquired_date": item.acquired_date.isoformat() if item.acquired_date else None,
            "rfid_tag": tag_info,
        })

    return {
        "id": b.id,
        "isbn": b.isbn,
        "title": b.title,
        "subtitle": b.subtitle,
        "publisher": b.publisher,
        "year": b.year,
        "language": b.language,
        "edition": b.edition,
        "description": b.description,
        "pages": b.pages,
        "cover_url": b.cover_url,
        "is_reference": b.is_reference,
        "category": {"id": b.category.id, "name": b.category.name, "code": b.category.code} if b.category else None,
        "authors": [{"id": a.id, "name": a.name} for a in b.authors],
        "copies": copies,
        "total_copies": len(copies),
        "available_copies": sum(1 for c in copies if c["status"] == "Available"),
    }

@router.post("")
def create_book(book_in: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.Book).filter_by(isbn=book_in.isbn).first()
    if existing:
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists")

    new_book = models.Book(
        isbn=book_in.isbn,
        title=book_in.title,
        subtitle=book_in.subtitle,
        publisher=book_in.publisher,
        year=book_in.year,
        category_id=book_in.category_id,
        language=book_in.language,
        edition=book_in.edition,
        description=book_in.description,
        pages=book_in.pages,
        is_reference=book_in.is_reference,
    )

    if book_in.author_ids:
        authors = db.query(models.Author).filter(models.Author.id.in_(book_in.author_ids)).all()
        new_book.authors = authors

    db.add(new_book)
    db.flush()

    # Generate physical copies
    cat = db.query(models.Category).filter_by(id=book_in.category_id).first()
    cat_code = cat.code if cat else "GEN"

    created_items = []
    for copy_idx in range(1, book_in.num_copies + 1):
        count_existing_items = db.query(models.BookItem).count() + 1
        acc_num = f"ACC-{cat_code}-{count_existing_items:05d}"
        barcode = f"BC{cat_code}{count_existing_items:06d}"

        item = models.BookItem(
            book_id=new_book.id,
            accession_number=acc_num,
            barcode=barcode,
            shelf_location=book_in.shelf_location,
            status="Available"
        )
        db.add(item)
        db.flush()

        # Generate linked RFID Tag
        tag_uid = f"E280116060{count_existing_items:06d}"
        tag = models.RFIDTag(
            tag_uid=tag_uid,
            item_id=item.id,
            tag_type="UHF_ISO_18000_6C",
            security_bit=1, # Armed by default
            status="ACTIVE"
        )
        db.add(tag)
        created_items.append(item)

    # Log audit
    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="BOOK_CREATE",
        resource="Book",
        resource_id=str(new_book.id),
        details=f"Created title '{new_book.title}' with {book_in.num_copies} copies"
    ))

    db.commit()
    db.refresh(new_book)

    return {
        "id": new_book.id,
        "title": new_book.title,
        "isbn": new_book.isbn,
        "copies_created": len(created_items),
        "message": "Book successfully registered with physical copies and RFID tags"
    }

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    b = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check active loans
    for item in b.items:
        active_loan = db.query(models.Loan).filter(models.Loan.item_id == item.id, models.Loan.status.in_(["Issued", "Overdue"])).first()
        if active_loan:
            raise HTTPException(status_code=400, detail="Cannot delete book with active or overdue loans")

    title = b.title
    db.delete(b)
    db.add(models.AuditLog(
        username=current_user.username if current_user else "admin",
        action="BOOK_DELETE",
        resource="Book",
        resource_id=str(book_id),
        details=f"Deleted book '{title}'"
    ))
    db.commit()
    return {"message": f"Book '{title}' successfully deleted"}
