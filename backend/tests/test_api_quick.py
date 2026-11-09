from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    
    print("Testing /api/health...")
    r = client.get("/api/health")
    print("Health response:", r.status_code, r.json())
    assert r.status_code == 200

    print("Testing /api/dashboard/stats...")
    r = client.get("/api/dashboard/stats")
    print("Dashboard response:", r.status_code, r.json()["metrics"])
    assert r.status_code == 200

    print("Testing /api/books...")
    r = client.get("/api/books?limit=5")
    print("Books response:", r.status_code, "Total:", r.json()["total"], "Items returned:", len(r.json()["items"]))
    assert r.status_code == 200

    print("Testing /api/members...")
    r = client.get("/api/members?limit=5")
    print("Members response:", r.status_code, "Total:", r.json()["total"])
    assert r.status_code == 200

    print("Testing /api/circulation/loans...")
    r = client.get("/api/circulation/loans?limit=5")
    print("Circulation loans response:", r.status_code, "Total:", r.json()["total"])
    assert r.status_code == 200

    print("Testing /api/rfid/tags...")
    r = client.get("/api/rfid/tags?limit=5")
    print("RFID tags response:", r.status_code, "Total:", r.json()["total"])
    assert r.status_code == 200

    print("ALL API ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
