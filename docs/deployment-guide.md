# AISYS RFID Library Intelligence OS — Deployment & Operational Launch Guide

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu 22.04+).
- **Python**: Python 3.10, 3.11, or 3.12 (pure Python mode, zero untrusted DLL dependencies).
- **Node.js**: Node.js 18.x, 20.x, or 22.x with npm.
- **Port Availability**:
  - `http://localhost:5173` (Vite Development / Preview Server)
  - `http://127.0.0.1:8000` (FastAPI REST Backend)

---

## 2. One-Click Quick Launch (Windows)

We provide batch launcher scripts in the project root:

### Step 1: Start Backend
Double-click `run_backend.bat` or run in PowerShell:
```powershell
cd aisys-rfid-library\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Docs will be live at `http://127.0.0.1:8000/docs`.

### Step 2: Start Frontend
Double-click `run_frontend.bat` or run in a second PowerShell terminal:
```powershell
cd aisys-rfid-library\frontend
npm run dev
```
Open `http://localhost:5173` in any modern web browser.

---

## 3. Database Initialization & Synthetic Seeding

To re-initialize or re-seed the SQLite database with 104 book titles, 311 physical copies, 54 members, and RFID tags:
```powershell
cd aisys-rfid-library\backend
python -m app.database.seed
```

---

## 4. Running Verification Test Suites

To execute the direct API endpoint test suite:
```powershell
cd aisys-rfid-library\backend
python -m tests.test_endpoints_direct
```

To execute the full **AC 01 to AC 10 Acceptance Criteria Test Suite**:
```powershell
cd aisys-rfid-library\backend
python -m tests.test_acceptance_criteria
```

---

## 5. Offline Deployment & Air-Gapped Operation

The AISYS system is architected for completely offline or air-gapped institutions:
- SQLite database resides entirely locally in `backend/aisys_library.db`.
- No telemetry, external CDNs, or external cloud calls are required.
- All styles, icons (Lucide), and chart rendering libraries (Recharts) are bundled locally in the compiled client build.
