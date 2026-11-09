from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# --- BOOK SCHEMAS ---
class BookItemRead(BaseModel):
    id: int
    accession_number: str
    barcode: str
    shelf_location: str
    status: str
    acquired_date: Optional[datetime] = None
    rfid_tag: Optional[dict] = None

    class Config:
        orm_mode = True

class BookAuthorRead(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class BookCategoryRead(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        orm_mode = True

class BookRead(BaseModel):
    id: int
    isbn: str
    title: str
    subtitle: Optional[str] = None
    publisher: Optional[str] = None
    year: Optional[int] = None
    language: str
    edition: Optional[str] = None
    description: Optional[str] = None
    pages: Optional[int] = None
    cover_url: Optional[str] = None
    is_reference: bool
    category_id: Optional[int] = None
    category: Optional[BookCategoryRead] = None
    authors: List[BookAuthorRead] = []
    items: List[BookItemRead] = []
    available_copies: int = 0
    total_copies: int = 0

    class Config:
        orm_mode = True

class BookCreate(BaseModel):
    isbn: str
    title: str
    subtitle: Optional[str] = None
    publisher: Optional[str] = None
    year: Optional[int] = None
    category_id: int
    language: str = "English"
    edition: Optional[str] = "1st"
    description: Optional[str] = None
    pages: Optional[int] = None
    is_reference: bool = False
    author_ids: List[int] = []
    num_copies: int = 1
    shelf_location: str = "Shelf A-1"

# --- MEMBER SCHEMAS ---
class MemberRead(BaseModel):
    id: int
    membership_number: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    membership_type: str
    registration_date: datetime
    expiry_date: datetime
    status: str
    outstanding_fine: float
    active_loans_count: int = 0

    class Config:
        orm_mode = True

class MemberCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = "Computer Science"
    membership_type: str = "Student"
    status: str = "Active"

# --- CIRCULATION SCHEMAS ---
class IssueBookRequest(BaseModel):
    member_id: Optional[int] = None
    membership_number: Optional[str] = None
    item_id: Optional[int] = None
    accession_number: Optional[str] = None
    barcode: Optional[str] = None
    tag_uid: Optional[str] = None

class ReturnBookRequest(BaseModel):
    item_id: Optional[int] = None
    accession_number: Optional[str] = None
    barcode: Optional[str] = None
    tag_uid: Optional[str] = None
    condition: str = "Good"

class RenewBookRequest(BaseModel):
    loan_id: int

class LoanRead(BaseModel):
    id: int
    loan_number: str
    member_id: int
    item_id: int
    issue_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    renewal_count: int
    status: str
    member_name: Optional[str] = None
    book_title: Optional[str] = None
    accession_number: Optional[str] = None
    barcode: Optional[str] = None

    class Config:
        orm_mode = True

# --- RFID SCHEMAS ---
class RFIDTagRead(BaseModel):
    id: int
    tag_uid: str
    item_id: int
    tag_type: str
    security_bit: int
    status: str
    registration_date: datetime
    accession_number: Optional[str] = None
    book_title: Optional[str] = None
    shelf_location: Optional[str] = None

    class Config:
        orm_mode = True

class RFIDEncodeRequest(BaseModel):
    tag_uid: str
    accession_number: str
    tag_type: str = "UHF_ISO_18000_6C"

class RFIDGateSimulateRequest(BaseModel):
    tag_uid: str
    gate_location: str = "Main Entrance / Gate A"

class InventoryScanBatchRequest(BaseModel):
    shelf_location: str
    scanned_tags: List[str]

# --- GATE EVENT SCHEMAS ---
class GateEventRead(BaseModel):
    id: int
    event_id: str
    tag_uid: str
    accession_number: Optional[str] = None
    timestamp: datetime
    gate_location: str
    event_type: str
    auth_result: str
    alarm_status: str
    security_bit: int
    cctv_reference: Optional[str] = None
    book_title: Optional[str] = None

    class Config:
        orm_mode = True
