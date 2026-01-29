import requests

BASE_URL = "http://localhost:5000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_otp_verification_and_user_authentication():
    email = "testuser@example.com"
    otp_request_payload = {"email": email}

    # Step 1: Request OTP generation
    otp_gen_resp = requests.post(
        f"{BASE_URL}/auth/request-otp", json=otp_request_payload, headers=HEADERS, timeout=TIMEOUT
    )
    assert otp_gen_resp.status_code == 200, f"OTP request failed: {otp_gen_resp.text}"
    otp_gen_data = otp_gen_resp.json()
    assert "message" in otp_gen_data and "OTP sent" in otp_gen_data["message"]

    # NOTE: Since this is a test environment, assume OTP can be fetched through an API or a test hook
    # We'll try to get the OTP via a test endpoint /auth/get-latest-otp for the email
    # If such an endpoint is not available, this test would require manual OTP input or mocking.
    try:
        otp_retrieve_resp = requests.get(
            f"{BASE_URL}/auth/get-latest-otp", params={"email": email}, headers=HEADERS, timeout=TIMEOUT
        )
        assert otp_retrieve_resp.status_code == 200, f"Failed to get OTP: {otp_retrieve_resp.text}"
        otp_retrieve_data = otp_retrieve_resp.json()
        assert "otp" in otp_retrieve_data, "OTP not found in response"
        otp = otp_retrieve_data["otp"]
    except Exception:
        # If OTP retrieval endpoint not available, fallback to failure as OTP unknown
        raise AssertionError("Unable to retrieve OTP for verification test")

    # Step 2: Verify OTP and authenticate
    otp_verify_payload = {"email": email, "otp": otp}
    otp_verify_resp = requests.post(
        f"{BASE_URL}/auth/verify-otp", json=otp_verify_payload, headers=HEADERS, timeout=TIMEOUT
    )
    assert otp_verify_resp.status_code == 200, f"OTP verification failed: {otp_verify_resp.text}"
    otp_verify_data = otp_verify_resp.json()

    # Validate expected fields in response
    assert "token" in otp_verify_data or "session" in otp_verify_data, "No token or session in response"
    assert "message" in otp_verify_data, "No message in response"
    assert otp_verify_data.get("message").lower().find("success") != -1 or otp_verify_data.get("message").lower().find("authenticated") != -1

    # Step 3: Negative test - invalid OTP should return error
    invalid_otp_payload = {"email": email, "otp": "000000"}
    invalid_otp_resp = requests.post(
        f"{BASE_URL}/auth/verify-otp", json=invalid_otp_payload, headers=HEADERS, timeout=TIMEOUT
    )
    assert invalid_otp_resp.status_code in (400, 401), f"Invalid OTP accepted: {invalid_otp_resp.text}"
    invalid_otp_data = invalid_otp_resp.json()
    assert "error" in invalid_otp_data or "message" in invalid_otp_data
    assert "invalid" in invalid_otp_data.get("error", "").lower() or "invalid" in invalid_otp_data.get("message", "").lower()

test_otp_verification_and_user_authentication()