import requests
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_otp_generation_and_email_sending():
    endpoint = f"{BASE_URL}/auth/generate-otp"
    test_email = "testuser@example.com"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = {
        "email": test_email
    }

    start_time = time.time()
    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to generate OTP failed: {e}"
    elapsed = time.time() - start_time

    # Verify that response status code is 200 (success)
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    # Verify response body contains success indication (assume JSON with success key)
    try:
        json_resp = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    # Assume API returns keys: success (bool), message (str), otpGenerated (bool or otp code masked)
    assert "success" in json_resp, "Response JSON missing 'success' key"
    assert json_resp["success"] is True, f"OTP generation not successful: {json_resp.get('message','')}"
    assert "message" in json_resp, "Response JSON missing 'message' key"
    # Optionally check message if needed (e.g. OTP sent)

    # Verify that the API responds quickly (within 5 seconds to indicate non-blocking email sending)
    assert elapsed <= 5, f"API response too slow, took {elapsed:.2f} seconds, expected <= 5 seconds"

    # Verify /health endpoint to check service health (if possible)
    health_endpoint = f"{BASE_URL}/health"
    try:
        health_resp = requests.get(health_endpoint, timeout=TIMEOUT)
        assert health_resp.status_code == 200, f"/health endpoint returned status {health_resp.status_code}"
        try:
            health_json = health_resp.json()
            # If health JSON structure known, check keys: status='ok' or similar
            assert health_json.get("status","").lower() == "ok", "/health status not ok"
        except ValueError:
            # If no JSON response, accept plain 200 status as healthy
            pass
    except requests.RequestException:
        # If /health not reachable, this is not blocking test case but warn
        pass

test_otp_generation_and_email_sending()
