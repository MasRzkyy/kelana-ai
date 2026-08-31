import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing GET /health ---")
    res = client.get("/health")
    assert res.status_code == 200
    print("Health check response:", res.json())

    print("\n--- 2. Testing POST /api/v1/trips (Create Trip 1) ---")
    payload1 = {
        "destination": "Japan",
        "days": 5,
        "budget": 2000.0,
        "travel_month": "December",
        "travel_style": "family"
    }
    res = client.post("/api/v1/trips", json=payload1)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    trip1 = res.json()
    print("Created Trip 1:", trip1)
    assert trip1["destination"] == "Japan"
    assert trip1["category"] == "Standard"
    assert trip1["daily_budget"] == 400.0
    assert "created_at" in trip1
    trip1_id = trip1["id"]

    print("\n--- 3. Testing POST /api/v1/trips (Create Trip 2) ---")
    payload2 = {
        "destination": "Bali",
        "days": 4,
        "budget": 800.0,
        "travel_month": "June",
        "travel_style": "backpacker"
    }
    res = client.post("/api/v1/trips", json=payload2)
    assert res.status_code == 201
    trip2 = res.json()
    print("Created Trip 2:", trip2)
    assert trip2["category"] == "Backpacker"
    trip2_id = trip2["id"]

    print("\n--- 4. Testing GET /api/v1/trips (List all trips) ---")
    res = client.get("/api/v1/trips")
    assert res.status_code == 200
    trips = res.json()
    print(f"Retrieved {len(trips)} trips.")
    assert len(trips) >= 2

    print(f"\n--- 5. Testing GET /api/v1/trips/{trip1_id} ---")
    res = client.get(f"/api/v1/trips/{trip1_id}")
    assert res.status_code == 200
    print("Retrieved Trip 1 by ID:", res.json())
    assert res.json()["destination"] == "Japan"

    print(f"\n--- 6. Testing PUT /api/v1/trips/{trip1_id} (Update Budget & recalculate) ---")
    update_payload = {
        "budget": 5000.0
    }
    res = client.put(f"/api/v1/trips/{trip1_id}", json=update_payload)
    assert res.status_code == 200
    updated_trip = res.json()
    print("Updated Trip 1:", updated_trip)
    assert updated_trip["budget"] == 5000.0
    assert updated_trip["category"] == "Luxury"
    assert updated_trip["daily_budget"] == 1000.0

    print(f"\n--- 7. Testing DELETE /api/v1/trips/{trip2_id} ---")
    res = client.delete(f"/api/v1/trips/{trip2_id}")
    assert res.status_code == 200
    print("Delete response:", res.json())

    print(f"\n--- 8. Testing GET deleted trip {trip2_id} (Expect 404) ---")
    res = client.get(f"/api/v1/trips/{trip2_id}")
    assert res.status_code == 404
    print("404 Response verified:", res.json())

    print("\nALL CRUD TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
