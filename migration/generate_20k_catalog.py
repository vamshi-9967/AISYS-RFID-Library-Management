import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

def generate_catalog_excel(num_records=20000, output_path="aisys-rfid-library/migration/sample_data/synthetic_20k_books.xlsx"):
    print(f"Generating synthetic catalog dataset with {num_records:,} records...")
    wb = openpyxl.Workbook(write_only=True)
    ws = wb.create_sheet(title="Academic Catalog")

    # Header Row
    headers = [
        "ISBN", "Title", "Subtitle", "Authors", "Publisher", "Publication Year",
        "Category Code", "Category Name", "Language", "Edition", "Pages",
        "Number of Copies", "Shelf Location", "Is Reference"
    ]
    ws.append(headers)

    categories = [
        ("CS", "Computer Science"),
        ("SE", "Software Engineering"),
        ("AR", "Architecture"),
        ("AI", "Artificial Intelligence"),
        ("DO", "Cloud & DevOps"),
        ("DS", "Data Science & Big Data"),
        ("NW", "Computer Networks & Security"),
        ("RO", "Robotics & Embedded Systems")
    ]

    authors_pool = [
        "Joshua Bloch", "Martin Kleppmann", "Robert C. Martin", "Gregor Hohpe",
        "Erich Gamma", "Stuart Russell", "Peter Norvig", "Andrew S. Tanenbaum",
        "Donald E. Knuth", "Thomas H. Cormen", "Kelsey Hightower", "Brendan Burns"
    ]

    publishers_pool = [
        "O'Reilly Media", "MIT Press", "Addison-Wesley Professional",
        "Cambridge University Press", "Springer Nature", "Pragmatic Bookshelf"
    ]

    topics = [
        "Distributed Systems and Microservices Patterns",
        "High-Performance Database Architecture and Internals",
        "Deep Learning and Generative AI Architectures",
        "Modern Operating Systems and Kernel Internals",
        "Algorithm Design and Complexity Analysis",
        "Enterprise Integration and Event-Driven Messaging",
        "Cloud-Native Kubernetes Engineering and Topologies",
        "Computer Vision with Deep Neural Networks",
        "Full-Stack Web Engineering and Reactive Systems",
        "Cryptography, Blockchain and Decentralized Trust"
    ]

    for idx in range(1, num_records + 1):
        cat_code, cat_name = categories[idx % len(categories)]
        author = authors_pool[idx % len(authors_pool)]
        publisher = publishers_pool[idx % len(publishers_pool)]
        topic = topics[idx % len(topics)]
        
        # Inject intentional validation anomalies on rare rows for QA verification
        is_bad_isbn = (idx == 500)
        is_missing_title = (idx == 1200)

        isbn = "BAD-ISBN-TEST" if is_bad_isbn else f"978-0-{100000 + (idx % 800000):06d}-{idx % 10}"
        title = "" if is_missing_title else f"{topic}: Volume {idx:05d}"
        subtitle = "Theory, Protocols, and Enterprise Implementations"
        year = 2018 + (idx % 7)
        edition = f"{(idx % 5) + 1}th Edition"
        pages = 300 + (idx % 500)
        copies = 1 + (idx % 4)
        shelf = f"Shelf {cat_code}-{(idx % 20) + 1:02d}"
        is_ref = "YES" if (idx % 15 == 0) else "NO"

        ws.append([
            isbn, title, subtitle, author, publisher, year,
            cat_code, cat_name, "English", edition, pages,
            copies, shelf, is_ref
        ])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    wb.save(output_path)
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Successfully generated {output_path} ({file_size_mb:.2f} MB) with {num_records:,} rows!")

if __name__ == "__main__":
    generate_catalog_excel()
