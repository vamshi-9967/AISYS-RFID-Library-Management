import sys
import os
from datetime import datetime, timedelta
import bcrypt

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.session import SessionLocal, engine, Base
import app.models as models

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.User).filter_by(username="admin").first():
            print("Database already seeded with admin user.")
            return

        print("Seeding AISYS Library database...")

        # 1. ROLES & PERMISSIONS
        roles_data = [
            ("ADMIN", "Full system administrator access, backups, and security settings"),
            ("LIBRARIAN", "Manage books, members, circulation, RFID, and inventory audits"),
            ("ASSISTANT", "Permitted checkout, checkin, and handheld inventory scanning"),
            ("VIEWER", "Read-only access to operational dashboards and reports"),
        ]
        roles_map = {}
        for name, desc in roles_data:
            role = models.Role(name=name, description=desc)
            db.add(role)
            db.flush()
            roles_map[name] = role

        # Permissions
        admin_perms = [
            ("all", "all"),
            ("users", "manage"),
            ("settings", "update"),
            ("backup", "execute")
        ]
        for res, act in admin_perms:
            db.add(models.Permission(role_id=roles_map["ADMIN"].id, resource=res, action=act))

        # 2. USERS
        admin_user = models.User(
            username="admin",
            email="admin@aisys.local",
            full_name="Chandra Vamshi",
            hashed_password=hash_password("admin123"),
            role_id=roles_map["ADMIN"].id,
            is_active=True,
            last_login=datetime.utcnow()
        )
        db.add(admin_user)

        lib_user = models.User(
            username="librarian",
            email="librarian@aisys.local",
            full_name="Kavita Menon",
            hashed_password=hash_password("lib123"),
            role_id=roles_map["LIBRARIAN"].id,
            is_active=True,
            last_login=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(lib_user)
        db.flush()

        # 3. SMART CARDS
        db.add(models.SmartCard(card_uid="SC-STAFF-ADMIN-01", user_id=admin_user.id, status="ACTIVE"))
        db.add(models.SmartCard(card_uid="SC-STAFF-LIB-02", user_id=lib_user.id, status="ACTIVE"))

        # 4. CATEGORIES
        cat_defs = [
            ("Computer Science", "CS", "Core algorithms, data structures, and computer theory"),
            ("Software Engineering", "SE", "Software design, architecture, agile development, testing"),
            ("Architecture", "AR", "Distributed systems, enterprise design patterns, cloud topologies"),
            ("Artificial Intelligence", "AI", "Machine learning, neural networks, computer vision, NLP"),
            ("Cloud & DevOps", "DO", "Kubernetes, containerization, microservices, continuous delivery"),
        ]
        cat_map = {}
        for name, code, desc in cat_defs:
            cat = models.Category(name=name, code=code, description=desc)
            db.add(cat)
            db.flush()
            cat_map[name] = cat

        # 5. AUTHORS
        author_names = [
            "Joshua Bloch", "Thomas H. Cormen", "Charles E. Leiserson",
            "Martin Kleppmann", "Robert C. Martin", "Gregor Hohpe",
            "Bobby Woolf", "Erich Gamma", "Richard Helm", "Ralph Johnson",
            "John Vlissides", "Kelsey Hightower", "Brendan Burns",
            "Joe Beda", "François Chollet", "Andrew S. Tanenbaum",
            "Maarten van Steen", "Stuart Russell", "Peter Norvig",
            "Donald E. Knuth", "Jon Bentley", "Steve McConnell"
        ]
        author_map = {}
        for a_name in author_names:
            author = models.Author(name=a_name, biography=f"Distinguished computer scientist and author of {a_name}.")
            db.add(author)
            db.flush()
            author_map[a_name] = author

        # 6. BOOKS & PHYSICAL COPIES (100+ titles)
        base_books = [
            ("Effective Java", "978-0134685991", "Best Practices for the Java Platform", "Joshua Bloch", "Computer Science", 2018, False, 4),
            ("Introduction to Algorithms", "978-0262033848", "A Comprehensive Reference", "Thomas H. Cormen", "Computer Science", 2022, True, 3), # Ref
            ("Designing Data-Intensive Applications", "978-1491957660", "Reliable, Scalable Systems", "Martin Kleppmann", "Architecture", 2017, False, 3),
            ("Clean Code", "978-0132350884", "Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Software Engineering", 2008, False, 4),
            ("Enterprise Integration Patterns", "978-1449361327", "Messaging Solutions", "Gregor Hohpe", "Architecture", 2003, False, 2),
            ("Design Patterns", "978-0201633610", "Reusable Object-Oriented Software", "Erich Gamma", "Architecture", 1994, False, 3),
            ("Kubernetes: Up and Running", "978-1492041139", "Future of Infrastructure", "Kelsey Hightower", "Cloud & DevOps", 2022, False, 2),
            ("Deep Learning with Python", "978-1119544401", "Building AI Models", "François Chollet", "Artificial Intelligence", 2021, False, 3),
            ("Distributed Systems", "978-1543057386", "Principles and Paradigms", "Andrew S. Tanenbaum", "Architecture", 2017, False, 3),
            ("Artificial Intelligence: A Modern Approach", "978-0134610993", "Standard reference", "Stuart Russell", "Artificial Intelligence", 2020, True, 3), # Ref
            ("The Art of Computer Programming", "978-0201896831", "Fundamental Algorithms", "Donald E. Knuth", "Computer Science", 1997, True, 2), # Ref
            ("Code Complete", "978-0735619678", "Practical Handbook of Construction", "Steve McConnell", "Software Engineering", 2004, False, 3),
            ("Programming Pearls", "978-0201657883", "Cracking complex logic", "Jon Bentley", "Computer Science", 1999, False, 2),
        ]

        # Generate up to 100 titles programmatically with realistic data
        for i in range(14, 105):
            cat_choice = list(cat_map.keys())[i % len(cat_map)]
            author_choice = author_names[i % len(author_names)]
            is_ref = (i % 8 == 0)
            base_books.append((
                f"Engineering Informatics Vol {i}: Advanced Principles in {cat_choice}",
                f"978-013{100000 + i}",
                f"Standard Academic Edition Series #{i}",
                author_choice,
                cat_choice,
                2020 + (i % 5),
                is_ref,
                2 + (i % 3)
            ))

        all_items = []
        all_tags = []
        global_copy_idx = 100

        for title, isbn, subtitle, author_name, cat_name, yr, is_ref, copy_count in base_books:
            cat = cat_map[cat_name]
            book = models.Book(
                title=title,
                isbn=isbn,
                subtitle=subtitle,
                category_id=cat.id,
                publisher="AISYS Academic Publishing",
                year=yr,
                language="English",
                edition="1st Edition",
                pages=320 + (global_copy_idx % 200),
                is_reference=is_ref,
                cover_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80"
            )
            if author_name in author_map:
                book.authors.append(author_map[author_name])
            db.add(book)
            db.flush()

            for c in range(copy_count):
                global_copy_idx += 1
                acc_no = f"ACC-{cat.code}-{global_copy_idx:05d}"
                bc = f"BC{global_copy_idx:05d}"
                shelf = f"Shelf {chr(65 + (global_copy_idx % 4))}-{(global_copy_idx % 3) + 1}"
                rfid_uid = f"E28011606000{global_copy_idx:04d}"

                status = "Reference Only" if is_ref else "Available"
                item = models.BookItem(
                    book_id=book.id,
                    accession_number=acc_no,
                    barcode=bc,
                    shelf_location=shelf,
                    status=status
                )
                db.add(item)
                db.flush()
                all_items.append(item)

                # Provision RFID Tag
                tag = models.RFIDTag(
                    tag_uid=rfid_uid,
                    item_id=item.id,
                    tag_type="HF 13.56 MHz ISO 15693",
                    security_bit=1, # Armed
                    status="ACTIVE"
                )
                db.add(tag)
                all_tags.append(tag)

        # 7. MEMBERS (50+ members)
        departments = ["Computer Science", "Information Technology", "Electronics & Comm", "Artificial Intelligence", "Mechanical Eng"]
        types = ["Student", "Faculty", "Researcher"]
        members_list = []

        sample_names = [
            ("Aarav Sharma", "Student", "Computer Science"),
            ("Dr. Sunita Rao", "Faculty", "Information Technology"),
            ("Rohan Varma", "Student", "Electronics & Comm"),
            ("Ananya Patel", "Researcher", "Artificial Intelligence"),
            ("Vikram Malhotra", "Student", "Mechanical Eng"),
            ("Pooja Hegde", "Student", "Computer Science"),
            ("Prof. Rajesh Nair", "Faculty", "Computer Science"),
            ("Meera Iyer", "Researcher", "Information Technology"),
            ("Siddharth Sengupta", "Student", "Electronics & Comm"),
            ("Kavya Reddy", "Student", "Artificial Intelligence"),
        ]

        # Generate 50 members
        for idx in range(1, 55):
            if idx <= len(sample_names):
                f_name, m_type, dept = sample_names[idx - 1]
            else:
                f_name = f"Patron User {idx}"
                m_type = types[idx % len(types)]
                dept = departments[idx % len(departments)]

            is_blocked = (idx == 3)
            is_expired = (idx == 5)
            status = "Blocked" if is_blocked else ("Expired" if is_expired else "Active")
            fine_amount = 65.00 if is_blocked else (5.50 if idx == 4 else 0.00)

            member = models.Member(
                membership_number=f"MEM-2024-{idx:03d}",
                full_name=f_name,
                email=f"patron{idx}@university.edu",
                phone=f"+91 98{idx:02d}0 {1000 + idx}",
                department=dept,
                membership_type=m_type,
                registration_date=datetime.utcnow() - timedelta(days=200),
                expiry_date=datetime.utcnow() - timedelta(days=30) if is_expired else datetime.utcnow() + timedelta(days=365),
                status=status,
                outstanding_fine=fine_amount
            )
            db.add(member)
            db.flush()
            members_list.append(member)

        # 8. CIRCULATION LOANS & FINES
        # Loan 1: Active Loan
        loan1 = models.Loan(
            loan_number="LN-2026-1001",
            member_id=members_list[0].id,
            item_id=all_items[0].id,
            issue_date=datetime.utcnow() - timedelta(days=5),
            due_date=datetime.utcnow() + timedelta(days=9),
            status="Issued"
        )
        all_items[0].status = "Issued"
        all_tags[0].security_bit = 0 # Cleared for issue
        db.add(loan1)

        # Loan 2: Overdue Loan with fine
        loan2 = models.Loan(
            loan_number="LN-2026-1002",
            member_id=members_list[2].id,
            item_id=all_items[1].id,
            issue_date=datetime.utcnow() - timedelta(days=40),
            due_date=datetime.utcnow() - timedelta(days=26),
            status="Overdue"
        )
        all_items[1].status = "Issued"
        all_tags[1].security_bit = 0
        db.add(loan2)
        db.flush()

        fine2 = models.Fine(
            loan_id=loan2.id,
            member_id=members_list[2].id,
            amount=65.00,
            status="Pending"
        )
        db.add(fine2)

        # 9. GATE SECURITY EVENTS
        db.add(models.GateEvent(
            event_id="GATE-EV-901",
            tag_uid=all_tags[2].tag_uid,
            accession_number=all_items[2].accession_number,
            item_id=all_items[2].id,
            timestamp=datetime.utcnow() - timedelta(minutes=15),
            gate_location="Main Entrance / Gate A",
            event_type="EGRESS_SCAN",
            auth_result="UNAUTHORIZED",
            alarm_status="TRIGGERED",
            security_bit=1,
            cctv_reference="CCTV_CAM01_20261109_174210.jpg",
            notification_status="QUEUED"
        ))

        db.add(models.GateEvent(
            event_id="GATE-EV-900",
            tag_uid=all_tags[0].tag_uid,
            accession_number=all_items[0].accession_number,
            item_id=all_items[0].id,
            timestamp=datetime.utcnow() - timedelta(hours=2),
            gate_location="Main Entrance / Gate A",
            event_type="EGRESS_SCAN",
            auth_result="AUTHORIZED",
            alarm_status="QUIET",
            security_bit=0,
            cctv_reference="CCTV_CAM01_20261109_161502.jpg",
            notification_status="NOT_REQUIRED"
        ))

        # 10. SYSTEM SETTINGS
        settings_defaults = [
            ("LOAN_DURATION_DAYS", "14", "Standard loan duration period in days"),
            ("MAX_BORROW_STUDENT", "5", "Maximum books borrowable concurrently by student"),
            ("MAX_BORROW_FACULTY", "10", "Maximum books borrowable concurrently by faculty"),
            ("DAILY_FINE_RATE", "1.50", "Overdue fine charged per day in dollars"),
            ("MAX_FINE_BLOCK_THRESHOLD", "50.00", "Fine balance above which account is blocked"),
            ("ENABLE_GATE_AUDIO_ALARM", "true", "Sound audible buzzer on unauthorized gate egress"),
            ("INSTITUTION_NAME", "AISYS Central Academic Library", "Formal library identity")
        ]
        for k, v, d in settings_defaults:
            db.add(models.LibrarySetting(key=k, value=v, description=d))

        # 11. AUDIT LOGS
        db.add(models.AuditLog(
            username="admin",
            action="SYSTEM_INIT",
            resource="Database",
            resource_id="SQLITE_WAL",
            details="System initialized with synthetic seed data: 104 titles, 250+ copies, 54 members",
            ip_address="127.0.0.1"
        ))

        db.commit()
        print(f"Database successfully seeded! Created {len(base_books)} titles, {len(all_items)} physical copies, {len(members_list)} members.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
