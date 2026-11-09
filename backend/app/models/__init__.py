# AISYS RFID Library Management System - SQLAlchemy ORM Models Registry

from app.database.session import Base

# 1. User & Access Control
from app.models.user import Role, Permission, User, SmartCard

# 2. Cataloguing & Physical Inventory
from app.models.book import Category, Author, Book, BookItem, book_authors

# 3. Patron & Membership
from app.models.member import Member

# 4. Circulation & Penalties
from app.models.circulation import Loan, Fine

# 5. RFID Middleware & Loss Prevention
from app.models.rfid import RFIDTag, InventorySession, InventoryScan, GateEvent

# 6. Operations & Data Pipeline
from app.models.system import AuditLog, Notification, MigrationJob, MigrationRow, LibrarySetting

__all__ = [
    "Base",
    # 1-4
    "Role",
    "Permission",
    "User",
    "SmartCard",
    # 5-9
    "Category",
    "Author",
    "Book",
    "BookItem",
    "book_authors",
    # 10
    "Member",
    # 11-12
    "Loan",
    "Fine",
    # 13-16
    "RFIDTag",
    "InventorySession",
    "InventoryScan",
    "GateEvent",
    # 17-20
    "AuditLog",
    "Notification",
    "MigrationJob",
    "MigrationRow",
    "LibrarySetting",
]
