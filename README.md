# AISYS RFID-Enabled Library Management System

A web-based RFID-enabled Library Management System built with React, FastAPI, and SQLite.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend**: Python 3.15, FastAPI, SQLAlchemy, Pydantic, Alembic
- **Database**: SQLite (development), PostgreSQL-ready architecture
- **RFID**: Simulated middleware with device-neutral adapter interfaces

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- npm 10+
- Git

### Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Status
- [x] Phase 1: Project Foundation
- [ ] Phase 2: Database & Authentication
- [ ] Phase 3: Frontend Foundation
- [ ] Phase 4: Core Library Modules
- [ ] Phase 5: RFID Integration
- [ ] Phase 6: Migration & Reporting
- [ ] Phase 7: Security & Resilience
- [ ] Phase 8: Testing
- [ ] Phase 9: Documentation
- [ ] Phase 10: Final Demonstration

## License
Proprietary - AISYS
