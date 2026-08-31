import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_auth_and_protection():
    print("==================================================")
    print("   SESSION 08: FULL AUTH & PROTECTED APIS LAB     ")
    print("==================================================")

    # 1. Health Check
    print("\n--- 1. Testing GET /health ---")
    res = client.get("/health")
    assert res.status_code == 200

    # 2. Register User 1 (Alice)
    print("\n--- 2. Registering User 1 (Alice) ---")
    alice_reg = client.post("/api/v1/auth/register", json={
        "name": "Alice Travel",
        "email": "alice@example.com",
        "password": "password123"
    })

    # 3. Login User 1 (Alice) -> Get JWT Token
    print("\n--- 3. Logging in Alice & Receiving JWT Token ---")
    alice_login = client.post("/api/v1/auth/login", json={
        "email": "alice@example.com",
        "password": "password123"
    })
    assert alice_login.status_code == 200
    alice_token = alice_login.json()["access_token"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    print("Alice Token Received:", alice_token[:30] + "...")

    # 4. Register & Login User 2 (Bob)
    print("\n--- 4. Registering & Logging in User 2 (Bob) ---")
    client.post("/api/v1/auth/register", json={
        "name": "Bob Explorer",
        "email": "bob@example.com",
        "password": "password123"
    })
    bob_login = client.post("/api/v1/auth/login", json={
        "email": "bob@example.com",
        "password": "password123"
    })
    assert bob_login.status_code == 200
    bob_token = bob_login.json()["access_token"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}
    print("Bob Token Received:", bob_token[:30] + "...")

    # 5. Test Unauthenticated Access Blocked (Expect 401)
    print("\n--- 5. Testing GET /api/v1/trips Without Token (Expect 401) ---")
    res_unauth = client.get("/api/v1/trips")
    assert res_unauth.status_code == 401
    print("Unauthenticated access correctly blocked (401):", res_unauth.json())

    # 6. Alice Creates a Trip (Japan)
    print("\n--- 6. Alice Creates a Trip (Japan) ---")
    res_alice_trip = client.post("/api/v1/trips", json={
        "destination": "Japan",
        "days": 5,
        "budget": 2000.0,
        "travel_style": "family"
    }, headers=alice_headers)
    assert res_alice_trip.status_code == 201
    alice_trip = res_alice_trip.json()
    print("Created Alice Trip:", alice_trip)
    assert alice_trip["destination"] == "Japan"

    # 7. Bob Creates a Trip (Korea)
    print("\n--- 7. Bob Creates a Trip (Korea) ---")
    res_bob_trip = client.post("/api/v1/trips", json={
        "destination": "Korea",
        "days": 4,
        "budget": 1500.0,
        "travel_style": "solo"
    }, headers=bob_headers)
    assert res_bob_trip.status_code == 201
    bob_trip = res_bob_trip.json()
    print("Created Bob Trip:", bob_trip)
    assert bob_trip["destination"] == "Korea"

    # 8. Ownership Filter Test (Alice sees ONLY Alice's trips)
    print("\n--- 8. Testing GET /api/v1/trips as Alice (Privacy Check) ---")
    res_alice_list = client.get("/api/v1/trips", headers=alice_headers)
    assert res_alice_list.status_code == 200
    alice_trips = res_alice_list.json()
    print(f"Alice sees {len(alice_trips)} trip(s):", [t["destination"] for t in alice_trips])
    for trip in alice_trips:
        assert trip["destination"] != "Korea", "SECURITY VIOLATION: Alice saw Bob's Korea trip!"

    # 9. Ownership Filter Test (Bob sees ONLY Bob's trips)
    print("\n--- 9. Testing GET /api/v1/trips as Bob (Privacy Check) ---")
    res_bob_list = client.get("/api/v1/trips", headers=bob_headers)
    assert res_bob_list.status_code == 200
    bob_trips = res_bob_list.json()
    print(f"Bob sees {len(bob_trips)} trip(s):", [t["destination"] for t in bob_trips])
    for trip in bob_trips:
        assert trip["destination"] != "Japan", "SECURITY VIOLATION: Bob saw Alice's Japan trip!"

    # 10. Cross-User Attack Prevention (Bob tries to DELETE Alice's trip)
    print("\n--- 10. Testing Bob attempting to DELETE Alice's trip (Expect 403 or 404) ---")
    res_attack = client.delete(f"/api/v1/trips/{alice_trip['id']}", headers=bob_headers)
    assert res_attack.status_code in (403, 404)
    print(f"Attack correctly blocked ({res_attack.status_code}):", res_attack.json())

    # 11. Alice Deletes Her Own Trip
    print("\n--- 11. Alice Deleting Her Own Trip (Expect 200) ---")
    res_del_own = client.delete(f"/api/v1/trips/{alice_trip['id']}", headers=alice_headers)
    assert res_del_own.status_code == 200
    print("Alice successfully deleted her trip:", res_del_own.json())

    print("\n==================================================")
    print("  ALL AUTHENTICATION & OWNERSHIP TESTS PASSED!   ")
    print("==================================================")

if __name__ == "__main__":
    test_full_auth_and_protection()
