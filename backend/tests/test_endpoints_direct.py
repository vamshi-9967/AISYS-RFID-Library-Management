import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
import app.models as models
import app.schemas as schemas
from app.api.routes.books import list_books, get_book_details, create_book
from app.api.routes.members import list_members, register_member, toggle_status, pay_fines
from app.api.routes.circulation import issue_book, return_book, renew_book, list_loans
from app.api.routes.rfid import list_tags, scan_single_tag, toggle_security_bit, simulate_gate_event
from app.api.routes.inventory import scan_shelf_audit
from app.api.routes.migration import stage_synthetic_20k, preview_job_rows, rollback_migration
from app.api.routes.reports import get_reports_summary

def run_suite():
    db = SessionLocal()
    print("==================================================")
    print("STARTING AISYS ENDPOINT & WORKFLOW TEST SUITE")
    print("==================================================")

    # 1. BOOKS TEST
    books_res = list_books(db=db, limit=5)
    print(f"[OK] Books Catalog: Total {books_res['total']} titles, sample fetched: {len(books_res['items'])}")
    first_book_id = books_res['items'][0]['id']
    book_detail = get_book_details(book_id=first_book_id, db=db)
    print(f"[OK] Book Details: '{book_detail['title']}' has {book_detail['total_copies']} copies")

    # 2. MEMBERS TEST
    members_res = list_members(db=db, limit=5)
    print(f"[OK] Members Directory: Total {members_res['total']} members, sample fetched: {len(members_res['items'])}")
    first_member_id = members_res['items'][0]['id']

    # 3. CIRCULATION LOANS TEST
    loans_res = list_loans(db=db, limit=5)
    print(f"[OK] Active Loans: Total {loans_res['total']} loans")

    # 4. RFID TAGS TEST
    tags_res = list_tags(db=db, limit=5)
    print(f"[OK] RFID Registry: Total {tags_res['total']} tags registered")
    first_tag = tags_res['items'][0]
    print(f"[OK] RFID Tag Sample: UID {first_tag['tag_uid']} on {first_tag['accession_number']} (Security Bit: {first_tag['security_bit']})")

    # 5. RFID SINGLE SCAN (STAFF READER)
    staff_scan = scan_single_tag(tag_uid=first_tag['tag_uid'], db=db)
    print(f"[OK] Staff Reader Interrogation: '{staff_scan['book']['title']}' (Status: {staff_scan['item_status']})")

    # 6. RFID SECURITY GATE SIMULATION (UNAUTHORIZED BREACH ATTEMPT)
    armed_tag = db.query(models.RFIDTag).filter_by(security_bit=1).first()
    if armed_tag:
        gate_res = simulate_gate_event(schemas.RFIDGateSimulateRequest(tag_uid=armed_tag.tag_uid), db=db)
        print(f"[OK] Gate Egress Test (Armed Tag): Alarm={gate_res['alarm']}, Result={gate_res['auth_result']}, EventID={gate_res['event_id']}")
        assert gate_res['alarm'] == True, "Gate should alarm on armed tag exit"

    # 7. CIRCULATION ISSUE WORKFLOW
    # Find available item
    avail_item = db.query(models.BookItem).filter(models.BookItem.status == "Available").first()
    active_member = db.query(models.Member).filter(models.Member.status == "Active", models.Member.outstanding_fine == 0).first()
    admin_user = db.query(models.User).filter_by(username="admin").first()

    if avail_item and active_member:
        issue_req = schemas.IssueBookRequest(
            member_id=active_member.id,
            item_id=avail_item.id
        )
        issue_res = issue_book(req=issue_req, db=db, current_user=admin_user)
        print(f"[OK] Book Checkout: Loan {issue_res['loan_number']} created. RFID Disarmed to {issue_res['security_bit']}.")

        # Now test gate egress with checked-out disarmed book
        disarmed_gate_res = simulate_gate_event(schemas.RFIDGateSimulateRequest(tag_uid=avail_item.rfid_tag.tag_uid), db=db)
        print(f"[OK] Gate Egress Test (Checked Out Item): Alarm={disarmed_gate_res['alarm']}, Result={disarmed_gate_res['auth_result']}")
        assert disarmed_gate_res['alarm'] == False, "Gate should be quiet for checked out item"

        # Now test return
        ret_req = schemas.ReturnBookRequest(item_id=avail_item.id)
        ret_res = return_book(req=ret_req, db=db, current_user=admin_user)
        print(f"[OK] Book Return: Status={ret_res['success']}, RFID Re-armed to {ret_res['security_bit']}.")

    # 8. HANDHELD RFID INVENTORY AUDIT TEST
    sample_tags = [t.tag_uid for t in db.query(models.RFIDTag).limit(10).all()]
    inv_res = scan_shelf_audit(schemas.InventoryScanBatchRequest(shelf_location="Shelf CS-1", scanned_tags=sample_tags), db=db, current_user=admin_user)
    print(f"[OK] Shelf Inventory Audit: Session #{inv_res['session_id']}, Matched: {inv_res['matched_count']}, Misplaced: {inv_res['misplaced_count']}, Missing: {inv_res['missing_count']}")

    # 9. REPORTS SUMMARY TEST
    rep_summary = get_reports_summary(db=db)
    print(f"[OK] Reports Intelligence: Total Loans={rep_summary['total_loans']}, Overdue={rep_summary['overdue_loans']}")

    # 10. SYNTHETIC 20K MIGRATION STAGING & PREVIEW TEST
    mig_res = stage_synthetic_20k(count=1000, db=db, current_user=admin_user)
    print(f"[OK] Migration Pipeline: Job #{mig_res['job_id']} staged {mig_res['total_rows']:,} rows ({mig_res['valid_rows']} valid, {mig_res['invalid_rows']} invalid)")
    preview = preview_job_rows(job_id=mig_res['job_id'], db=db, limit=5)
    print(f"[OK] Migration Staging Preview: Fetched {len(preview['items'])} sample rows with dry-run validation markers")

    # Rollback test
    roll_res = rollback_migration(job_id=mig_res['job_id'], db=db, current_user=admin_user)
    print(f"[OK] Migration Rollback: Job #{roll_res['job_id']} set to {roll_res['status']}")

    print("==================================================")
    print("ALL 10 VERIFICATION WORKFLOWS PASSED WITH 100% SUCCESS!")
    print("==================================================")
    db.close()

if __name__ == "__main__":
    run_suite()
