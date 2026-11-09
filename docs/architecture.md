# AISYS RFID Library Intelligence OS — System Architecture

## 1. Executive Architecture Summary

The AISYS RFID Library Intelligence OS is a high-availability, device-neutral library automation and loss prevention platform. It unifies bibliographic cataloguing, patron management, circulation control, handheld RFID inventory auditing, and entrance/exit security gate monitoring into a single unified workspace.

```mermaid
graph TD
    Client["React 19 + Tailwind CSS Frontend<br/>(Vite @ http://localhost:5173)"]
    API["FastAPI 0.103.2 REST Gateway<br/>(Uvicorn @ http://127.0.0.1:8000)"]
    DB[("SQLite 3 with WAL Mode<br/>(aisys_library.db)")]
    RFID["RFID Hardware Adapter Subsystem<br/>(Staff Pad, Handheld Wand, Security Gate)"]
    ILMS["Legacy ILMS Read Boundary<br/>(3M SIP2 / NCIP 2.0 Mock Isolation)"]

    Client -->|REST / JSON via Reverse Proxy| API
    API -->|SQLAlchemy 2.0 ORM| DB
    API -->|Adapter Pattern| RFID
    API -->|Documented Boundary (Non-Destructive)| ILMS
```

---

## 2. Layered Architecture

### 2.1 Presentation Layer (Frontend)
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v3.4.17 with PostCSS and Autoprefixer
- **State Management**: Reactive `LibraryContext` provider supporting automated background heartbeats, optimistic updates, and persistent Dark Mode (`localStorage.getItem('aisys_dark_mode')`).
- **Data Visualization**: Recharts (Interactive Area Trends, Donut Collection Distribution, Multi-bar Comparisons).
- **Icons**: Lucide React.

### 2.2 Application Services Layer (Backend Gateway)
- **Engine**: FastAPI 0.103.2 on Python 3.12 (pure Python deployment, WDAC-compliant).
- **Authentication**: JWT Bearer tokens (HS256) with Bcrypt password hashing.
- **Dependency Injection**: Session management via `get_db()`, user authorization via `get_current_user` and `require_role()`.

### 2.3 Hardware & Middleware Layer (RFID Subsystem)
- **Design Pattern**: Device-neutral Adapter Pattern (`BaseRFIDReader`, `BaseILMSAdapter`).
- **Protocols Supported**:
  - UHF Gen2 / ISO 18000-6C (860–960 MHz EPC transponders)
  - HF ISO 15693 / ISO 14443A (13.56 MHz patron smart cards & staff tokens)
  - 3M SIP2 over TCP/IP (Standard Interchange Protocol)
  - NCIP 2.0 (NISO Circulation Interchange Protocol)

### 2.4 Data Persistence Layer
- **Engine**: SQLite 3 with Write-Ahead Logging (`PRAGMA journal_mode=WAL`) and Foreign Key enforcement (`PRAGMA foreign_keys=ON`).
- **PostgreSQL Compatibility**: 100% ANSI SQL compatible types (VARCHAR, INTEGER, BOOLEAN, DATETIME) allowing zero-downtime migration to PostgreSQL in production environments.

---

## 3. Data Integrity & Non-Destructive Boundary Rule

> [!IMPORTANT]
> **Strict Non-Destructive Boundary Rule:**
> Under no circumstances does the AISYS prototype write to, overwrite, alter, or delete records in an external live ILMS database. All prototype operations target the local database. External ILMS adapters operate as read-isolated proxies.
