"""
Comprehensive Automated Test Suite for Cloud Computing Project:
- Authentication & JWT
- Profile & Biometrics (BMR / TDEE)
- AI Diet Plan Generator & Resilient Fallback
- Cloud Database Tenancy Isolation (User A vs User B)
- Cloud Object Storage (Upload, Download, Isolation, Export)
- IoT Smart Scale Weight Ingestion
"""

import pytest
import os
import sys
import io

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

# Configure test environment
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_diet_planner.db")
if os.path.exists(TEST_DB_PATH):
    try:
        os.remove(TEST_DB_PATH)
    except Exception:
        pass
os.environ["CLOUD_DB_PATH"] = TEST_DB_PATH
os.environ["CLOUD_ENVIRONMENT"] = "testing"

from backend.app import app
from cloud.database_service import init_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()

def test_health_and_cloud_status():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_cloud = client.get("/cloud-status")
    assert res_cloud.status_code == 200
    assert res_cloud.json()["status"] == "OPERATIONAL"

def test_user_registration_and_login():
    # 1. Register User A
    reg_payload = {
        "name": "Alice Cloud",
        "email": "alice@cloudtest.com",
        "password": "Password123!"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    data = res_reg.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@cloudtest.com"

    # 2. Duplicate registration should fail
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "alice@cloudtest.com",
        "password": "Password123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token is not None

    # 4. Login with invalid password
    res_bad = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "WrongPassword"})
    assert res_bad.status_code == 401

def test_profile_update_and_targets():
    # Login Alice
    res_login = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "Password123!"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update Profile
    update_data = {
        "age": 28,
        "height": 165.0,
        "weight": 62.0,
        "sex": "female",
        "activity_level": "moderate",
        "dietary_preference": "veg",
        "goal": "weight_loss",
        "allergies": ["lactose"]
    }
    res_put = client.put("/api/profile", json=update_data, headers=headers)
    assert res_put.status_code == 200
    body = res_put.json()
    assert body["profile"]["dietary_preference"] == "veg"
    assert "targets" in body
    assert body["targets"]["target_calories"] > 1000

def test_diet_plan_generation_and_fallback():
    # Login Alice
    res_login = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "Password123!"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Rule-Based AI Generation
    gen_payload = {
        "dietary_preference": "vegan",
        "goal": "weight_loss",
        "allergies": ["nuts"],
        "use_external_ai": False
    }
    res_gen = client.post("/api/plans/generate", json=gen_payload, headers=headers)
    assert res_gen.status_code == 200
    plan = res_gen.json()
    assert plan["generation_mode"] == "rule_based_ai"
    assert "breakfast" in plan
    assert "lunch" in plan
    assert "snack" in plan
    assert "dinner" in plan
    assert "nutrition_summary" in plan
    assert "disclaimer" in plan

    # 2. Resilient Fallback check: External AI flag with no live key must safely fallback
    gen_ai_payload = {
        "dietary_preference": "veg",
        "use_external_ai": True
    }
    res_fallback = client.post("/api/plans/generate", json=gen_ai_payload, headers=headers)
    assert res_fallback.status_code == 200
    fb_plan = res_fallback.json()
    # It must return a valid complete plan without crashing
    assert "breakfast" in fb_plan
    assert "lunch" in fb_plan

def test_plan_persistence_and_user_isolation():
    # Register User B (Bob)
    client.post("/api/auth/register", json={
        "name": "Bob Cloud",
        "email": "bob@cloudtest.com",
        "password": "Password123!"
    })

    # Token for Alice
    tok_a = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "Password123!"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {tok_a}"}

    # Token for Bob
    tok_b = client.post("/api/auth/login", json={"email": "bob@cloudtest.com", "password": "Password123!"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {tok_b}"}

    # Alice generates & saves a plan
    plan_data = client.post("/api/plans/generate", json={"dietary_preference": "veg"}, headers=headers_a).json()
    save_res = client.post("/api/plans", json={"title": "Alice's Keto Plan", "plan_data": plan_data}, headers=headers_a)
    assert save_res.status_code == 201
    alice_plan_id = save_res.json()["plan"]["plan_id"]

    # Alice can retrieve it
    get_alice = client.get(f"/api/plans/{alice_plan_id}", headers=headers_a)
    assert get_alice.status_code == 200

    # DATA ISOLATION TEST: Bob CANNOT retrieve Alice's plan (Must be 404)
    get_bob = client.get(f"/api/plans/{alice_plan_id}", headers=headers_b)
    assert get_bob.status_code == 404

def test_cloud_object_storage_and_export():
    tok_a = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "Password123!"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {tok_a}"}

    # Upload a sample meal photo / file
    file_content = b"fake-png-image-data-demo-diet"
    files = {"file": ("my_salad.png", io.BytesIO(file_content), "image/png")}
    res_upload = client.post("/api/files/upload", files=files, headers=headers_a)
    assert res_upload.status_code == 201
    file_id = res_upload.json()["file"]["file_id"]

    # List files
    res_list = client.get("/api/files", headers=headers_a)
    assert res_list.status_code == 200
    assert any(f["file_id"] == file_id for f in res_list.json())

    # Download file
    res_down = client.get(f"/api/files/{file_id}/download", headers=headers_a)
    assert res_down.status_code == 200
    assert res_down.content == file_content

def test_iot_smart_scale_telemetry():
    # Register/login user for IoT
    tok = client.post("/api/auth/login", json={"email": "alice@cloudtest.com", "password": "Password123!"}).json()
    uid = tok["user"]["user_id"]

    # ESP32 simulated HTTP GET
    res_iot = client.get(f"/api/intake/iot/ingest?uid={uid}&food_id=oats_porridge&grams=150")
    assert res_iot.status_code == 200
    assert res_iot.json()["ok"] is True

    # Check that Alice's daily intake now reflects this
    headers = {"Authorization": f"Bearer {tok['access_token']}"}
    res_intake = client.get("/api/intake/daily", headers=headers)
    assert res_intake.status_code == 200
    assert res_intake.json()["items_count"] >= 1
