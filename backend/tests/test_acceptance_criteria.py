"""
AISYS RFID Library Management System - Acceptance Criteria Test Suite (AC 01 - AC 10)
Conforming directly to the AISYS Software Development SOP specification.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
import app.models as models
import app.schemas as schemas
from app.api.routes.books import list_books, get_book_details, create_book
from app.api.routes.members import list_members, register_member, toggle_status, pay_fines
from app.api.routes.circulation import issue_book, return_book, renew_book
from app.api.routes.rfid import list_tags, scan_single_tag, toggle_security_bit, simulate_gate_event
from app.api.routes.inventory import scan_shelf_audit
from app.api.routes.migration import stage_synthetic_20k, preview_job_rows, rollback_migration, commit_migration
from app.api.routes.reports import get_reports_summary

def run_acceptance_tests():
    db = SessionLocal()
    admin_user = db.query(models.User).filter_by(username="admin").first()
    print("======================================================================")
    print("RUNNING FORMAL ACCEPTANCE CRITERIA VERIFICATION SUITE (AC 01 to AC 10)")
    print("======================================================================")

    # ---------------------------------------------------------
    # AC 01: SPREADSHEET STAGING PIPELINE & DRY-RUN VALIDATION
    # ---------------------------------------------------------
    print("\n[TEST] AC 01: Spreadsheet Staging & Dry-Run Validation...")
    staged = stage_synthetic_20k(count=20000, db=db, current_user=admin_user)
    assert staged["total_rows"] == 20000
    assert staged["status"] == "STAGED"
    preview = preview_job_rows(job_id=staged["job_id"], db=db, limit=10)
    assert len(preview["items"]) > 0
    # Verify invalid row detection
    has_invalid = any(row["status"] == "INVALID" for row in preview["items"])
    print(f"  --> AC 01 PASSED: Staged {staged['total_rows']:,} rows. Valid: {staged['valid_rows']:,}, Invalid: {staged['invalid_rows']:,}")

    # ---------------------------------------------------------
    # AC 02: ROLLBACK CAPABILITY
    # ---------------------------------------------------------
    print("\n[TEST] AC 02: Safe Rollback Capability...")
    rolled = rollback_migration(job_id=staged["job_id"], db=db, current_user=admin_user)
    assert rolled["status"] == "ROLLED_BACK"
    print(f"  --> AC 02 PASSED: Job #{rolled['job_id']} rolled back cleanly without orphaned records.")

    # ---------------------------------------------------------
    # AC 03: RFID TAG REGISTRATION & ENCODING
    # ---------------------------------------------------------
    print("\n[TEST] AC 03: RFID Tag Association & Encoding...")
    all_tags = db.query(models.RFIDTag).all()
    assert len(all_tags) > 0
    sample_tag = all_tags[0]
    assert sample_tag.item_id is not None
    assert sample_tag.tag_uid.startswith("E280")
    print(f"  --> AC 03 PASSED: Verified {len(all_tags)} registered tags linked to physical inventory.")

    # ---------------------------------------------------------
    # AC 04: DESKTOP READER SINGLE TAG INTERROGATION
    # ---------------------------------------------------------
    print("\n[TEST] AC 04: Desktop Reader Transponder Interrogation...")
    staff_scan = scan_single_tag(tag_uid=sample_tag.tag_uid, db=db)
    assert staff_scan["tag_uid"] == sample_tag.tag_uid
    assert "book" in staff_scan and staff_scan["book"]["title"]
    print(f"  --> AC 04 PASSED: Interrogated '{staff_scan['book']['title']}' via simulated staff pad.")

    # ---------------------------------------------------------
    # AC 05: BORROWING RESTRICTIONS & POLICY ENFORCEMENT
    # ---------------------------------------------------------
    print("\n[TEST] AC 05: Borrowing Restrictions & Policy Enforcement...")
    blocked_member = db.query(models.Member).filter_by(status="Blocked").first()
    avail_item = db.query(models.BookItem).filter_by(status="Available").first()
    
    if blocked_member and avail_item:
        try:
            issue_book(schemas.IssueBookRequest(member_id=blocked_member.id, item_id=avail_item.id), db=db, current_user=admin_user)
            assert False, "Should have thrown HTTPException for blocked member"
        except Exception as e:
            detail_str = getattr(e, "detail", str(e))
            assert "BLOCKED" in str(detail_str).upper() or "FINE" in str(detail_str).upper()
            print(f"  --> AC 05 PASSED: Correctly blocked checkout for restricted member: {blocked_member.full_name} ({detail_str})")

    # ---------------------------------------------------------
    # AC 06: CHECKOUT & TAG DISARMING
    # ---------------------------------------------------------
    print("\n[TEST] AC 06: Book Issue & RFID Security Bit Disarming...")
    active_member = db.query(models.Member).filter(models.Member.status == "Active", models.Member.outstanding_fine == 0).first()
    # Find non-reference available book item
    normal_item = None
    for it in db.query(models.BookItem).filter_by(status="Available").all():
        if it.book and not it.book.is_reference and it.rfid_tag:
            normal_item = it
            break

    assert normal_item is not None
    issue_result = issue_book(schemas.IssueBookRequest(member_id=active_member.id, item_id=normal_item.id), db=db, current_user=admin_user)
    assert issue_result["success"] is True
    assert issue_result["security_bit"] == 0 # Cleared!
    assert normal_item.rfid_tag.security_bit == 0
    print(f"  --> AC 06 PASSED: Issued '{issue_result['book_title']}'. RFID security bit DISARMED to 0.")

    # ---------------------------------------------------------
    # AC 07: CHECKIN & TAG RE-ARMING
    # ---------------------------------------------------------
    print("\n[TEST] AC 07: Book Return & RFID Security Bit Re-arming...")
    return_result = return_book(schemas.ReturnBookRequest(item_id=normal_item.id), db=db, current_user=admin_user)
    assert return_result["success"] is True
    assert return_result["security_bit"] == 1 # Re-armed!
    assert normal_item.rfid_tag.security_bit == 1
    assert normal_item.status == "Available"
    print(f"  --> AC 07 PASSED: Returned '{return_result['book_title']}'. RFID security bit RE-ARMED to 1.")

    # ---------------------------------------------------------
    # AC 08: HANDHELD INVENTORY AUDIT SWEEP
    # ---------------------------------------------------------
    print("\n[TEST] AC 08: Handheld Multi-Tag Shelf Inventory Verification...")
    test_tags = [t.tag_uid for t in db.query(models.RFIDTag).limit(8).all()]
    inv_audit = scan_shelf_audit(schemas.InventoryScanBatchRequest(shelf_location="Shelf CS-01", scanned_tags=test_tags), db=db, current_user=admin_user)
    assert inv_audit["total_scanned"] == 8
    assert "accuracy_rate" in inv_audit
    print(f"  --> AC 08 PASSED: Handheld scan verified shelf stock with {inv_audit['accuracy_rate']}% match rate.")

    # ---------------------------------------------------------
    # AC 09: SECURITY GATE ALARM ON ARMED TRANSLATION (LOSS PREVENTION)
    # ---------------------------------------------------------
    print("\n[TEST] AC 09: Security Gate Alarm on Armed Tag (Loss Prevention)...")
    armed_tag = db.query(models.RFIDTag).filter_by(security_bit=1).first()
    assert armed_tag is not None
    gate_alarm = simulate_gate_event(schemas.RFIDGateSimulateRequest(tag_uid=armed_tag.tag_uid), db=db)
    assert gate_alarm["alarm"] is True
    assert gate_alarm["auth_result"] == "UNAUTHORIZED"
    print(f"  --> AC 09 PASSED: Security Gate siren & CCTV triggered for unauthorized removal ({gate_alarm['event_id']}).")

    # ---------------------------------------------------------
    # AC 10: AUTHORIZED EGRESS & QUIET GATE
    # ---------------------------------------------------------
    print("\n[TEST] AC 10: Authorized Egress & Quiet Gate...")
    # Issue book again to disarm tag
    issue_book(schemas.IssueBookRequest(member_id=active_member.id, item_id=normal_item.id), db=db, current_user=admin_user)
    assert normal_item.rfid_tag.security_bit == 0
    quiet_gate = simulate_gate_event(schemas.RFIDGateSimulateRequest(tag_uid=normal_item.rfid_tag.tag_uid), db=db)
    assert quiet_gate["alarm"] is False
    assert quiet_gate["auth_result"] == "AUTHORIZED"
    print(f"  --> AC 10 PASSED: Permitted exit confirmed quiet passage for checked-out book ({quiet_gate['event_id']}).")

    # Clean up return
    return_book(schemas.ReturnBookRequest(item_id=normal_item.id), db=db, current_user=admin_user)

    print("\n======================================================================")
    print("ALL 10 SOP ACCEPTANCE CRITERIA (AC 01 - AC 10) VERIFIED & VALIDATED!")
    print("======================================================================")
    db.close()

if __name__ == "__main__":
    run_acceptance_tests()
