# AISYS RFID Library Intelligence OS — REST API Documentation

## 1. Overview & Base URL

All API routes are accessible under the `/api` prefix:
- **Base URL**: `http://127.0.0.1:8000/api`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **Interactive ReDoc UI**: `http://127.0.0.1:8000/redoc`

---

## 2. API Endpoint Matrix

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Service & database connectivity heartbeat | No |
| **Auth** | `POST` | `/api/auth/login` | Obtain JWT Bearer access token | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user credentials and role | Bearer |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Aggregated metrics, trends & activity logs | No |
| **Books** | `GET` | `/api/books` | Search, filter, and paginate titles | No |
| **Books** | `GET` | `/api/books/{id}` | Inspect title details and physical copies | No |
| **Books** | `POST` | `/api/books` | Register new title and generate copies/tags | Admin/Librarian |
| **Members** | `GET` | `/api/members` | Search patron directory & fine balances | No |
| **Members** | `POST` | `/api/members` | Register new patron | Librarian |
| **Members** | `PATCH` | `/api/members/{id}/status` | Update status (Active, Blocked, Expired) | Librarian |
| **Members** | `POST` | `/api/members/{id}/pay-fines` | Settle outstanding fines and unblock account | Librarian |
| **Circulation** | `GET` | `/api/circulation/loans` | List borrowing transactions and overdue states | No |
| **Circulation** | `POST` | `/api/circulation/issue` | Execute book checkout with 10 policy checks | Librarian |
| **Circulation** | `POST` | `/api/circulation/return` | Checkin book, re-arm RFID tag, assess fines | Librarian |
| **Circulation** | `POST` | `/api/circulation/renew` | Extend due date by loan duration | Librarian |
| **RFID** | `GET` | `/api/rfid/tags` | List registered transponders and security bits | No |
| **RFID** | `POST` | `/api/rfid/scan-single` | Interrogate transponder on staff desktop pad | No |
| **RFID** | `POST` | `/api/rfid/toggle-security` | Manually arm/disarm tag security bit | Librarian |
| **RFID** | `POST` | `/api/rfid/simulate-gate` | Simulate security gate crossing & alarm decision | No |
| **Inventory** | `GET` | `/api/inventory/sessions` | History of shelf audit sessions | No |
| **Inventory** | `POST` | `/api/inventory/scan-shelf` | Process handheld wand batch scan across shelf | Librarian |
| **Gate** | `GET` | `/api/gate/events` | Log of security gate passages & breach alarms | No |
| **Gate** | `POST` | `/api/gate/clear-alarm` | Acknowledge and resolve security gate alarm | Librarian |
| **Migration** | `GET` | `/api/migration/jobs` | Track 20,000-record migration jobs | Admin |
| **Migration** | `POST` | `/api/migration/stage-synthetic-20k` | Stage 20,000 synthetic records with dry-run | Admin |
| **Migration** | `GET` | `/api/migration/jobs/{id}/preview` | Preview staged rows with validation errors | Admin |
| **Migration** | `POST` | `/api/migration/jobs/{id}/commit` | Commit valid records into active catalog | Admin |
| **Migration** | `POST` | `/api/migration/jobs/{id}/rollback` | Roll back migration job to clean checkpoint | Admin |
| **Reports** | `GET` | `/api/reports/summary` | Overdue loans, fines, inventory accuracy | No |
| **Reports** | `GET` | `/api/reports/export-csv` | Stream filtered CSV report downloads | No |
