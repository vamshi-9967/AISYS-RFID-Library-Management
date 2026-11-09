from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

# Many-to-many junction table between books and authors
book_authors = Table(
    "book_authors",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
    Column("author_id", Integer, ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True),
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=True)
    description = Column(Text, nullable=True)

    books = relationship("Book", back_populates="category")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    biography = Column(Text, nullable=True)

    books = relationship("Book", secondary=book_authors, back_populates="authors")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    subtitle = Column(String(255), nullable=True)
    publisher = Column(String(150), nullable=True)
    year = Column(Integer, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    language = Column(String(50), default="English")
    edition = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    pages = Column(Integer, nullable=True)
    cover_url = Column(String(500), nullable=True)
    is_reference = Column(Boolean, default=False)  # Reference books cannot be loaned outside
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="books")
    authors = relationship("Author", secondary=book_authors, back_populates="books")
    items = relationship("BookItem", back_populates="book", cascade="all, delete-orphan")


class BookItem(Base):
    __tablename__ = "book_items"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    accession_number = Column(String(64), unique=True, nullable=False, index=True)
    barcode = Column(String(64), unique=True, nullable=False, index=True)
    shelf_location = Column(String(100), nullable=False, index=True)  # e.g. Shelf A-1
    status = Column(String(30), default="Available")  # Available, Issued, Reference Only, Missing, Damaged
    acquired_date = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="items")
    rfid_tag = relationship("RFIDTag", back_populates="item", uselist=False)
    loans = relationship("Loan", back_populates="item")
    gate_events = relationship("GateEvent", back_populates="item")
