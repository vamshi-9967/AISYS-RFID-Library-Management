# AISYS RFID Library Intelligence OS — Operator User Manual

## 1. System Navigation & Shell

The AISYS UI provides a unified operational dashboard with a collapsible navigation sidebar and top bar:
- **Dashboard**: High-level telemetry, live KPI cards, circulation activity curves, collection distribution donut charts, and quick-action shortcuts.
- **Dark Mode**: Toggle instantly via the Sun/Moon icon in the top navigation bar. Preferences persist across reloads.
- **Backend Heartbeat Indicator**: Displays real-time connectivity status to the local FastAPI controller (`ONLINE` / `CONNECTING` / `OFFLINE`).

---

## 2. Circulation Desk Workflows

### 2.1 Checking Out a Book (Issue)
1. Navigate to **Circulation Hub** or click **Issue Book** on the Dashboard Quick Actions.
2. Select the borrowing patron from the dropdown or scan their contactless Smart Card.
3. Enter the physical copy **Accession Number** or place the book on the **Staff RFID Desktop Pad**.
4. The system automatically executes **10 policy validations**:
   - Patron membership status is `Active` (not `Blocked` or `Expired`).
   - Outstanding fine balance does not exceed `$50.00`.
   - Patron borrowing quota has not been reached (Max 5 for Students, 10 for Faculty).
   - Item copy is marked `Available` (not `Reference Only` or `In Repair`).
5. Upon confirmation, the system creates the loan record, schedules the due date (14 days), and automatically **disarms the RFID transponder security bit to 0**, enabling authorized exit.

### 2.2 Returning a Book (Checkin)
1. Place the item on the return workstation pad or enter the **Accession Number**.
2. Click **Return Book**.
3. If overdue, the system assesses fines (`$1.50/day`) and records a pending fine against the borrower.
4. The item status immediately reverts to `Available`.
5. The RFID transponder security bit is **re-armed to 1**, reactivating perimeter theft protection.

---

## 3. Security Gate Monitoring & Loss Prevention

- Dual-pedestal security gates continuously scan items carried through the threshold.
- If a patron attempts to leave with an item whose security bit is **ARMED (1)**:
  - An audible 2800 Hz siren sounds and red LED strobe lights activate.
  - A CCTV frame capture is automatically logged (`CCTV_GATE_TIMESTAMP.jpg`).
  - An urgent incident is dispatched to the security operator desk.
- Operators can review breach incidents under the **Security Gate** tab and click **Resolve Alarm** after verifying the situation.

---

## 4. Handheld RFID Inventory Auditing

1. Navigate to **RFID Inventory**.
2. Select the target shelf section (e.g. `Shelf CS-01`).
3. Click **Start RFID Sweep**. The simulated handheld wand reads transponders at up to 650 tags/sec.
4. Review the audit reconciliation breakdown:
   - **Matched**: Books located on the correct shelf.
   - **Misplaced**: Books found on this shelf but catalogued for a different location.
   - **Missing**: Books catalogued on this shelf that were not detected by the scan wand.
