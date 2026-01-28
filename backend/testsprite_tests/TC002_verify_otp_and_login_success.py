import requests
import time

BASE_URL = "http://localhost:5000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_verify_otp_and_login_success():
    email = "testuser@example.com"
    name = "Test User"
    password = "StrongP@ssw0rd!"
    otp = None
    token = None

    try:
        # Step 1: Request OTP to be sent to email
        send_otp_resp = requests.post(
            f"{BASE_URL}/api/auth/send-email-otp",
            json={"email": email},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert send_otp_resp.status_code == 200, f"Send OTP failed: {send_otp_resp.text}"

        # As the system sends OTP asynchronously via email, wait briefly for OTP to be generated.
        # No direct access to OTP from the API, so poll or simulate waiting.
        # In a real test environment, OTP might be fetched from a test mailbox or test hook.
        # Here, we simulate retry fetching OTP from a hypothetical test endpoint (not in PRD)
        # since no such endpoint is specified, we wait fixed time to simulate manual OTP.

        # Wait up to 25 seconds to simulate user receiving OTP email
        # In a real scenario, fetch OTP from DB or mock
        time.sleep(5)  # wait 5 seconds as placeholder

        # For this test, assume OTP is known or dummy for testing, e.g. "123456"
        # Normally OTP should be captured dynamically; here we use placeholder:
        otp = "123456"

        verify_payload = {
            "email": email,
            "otp": otp,
            "name": name,
            "password": password
        }

        # Step 2: Verify OTP and login/register user
        verify_resp = requests.post(
            f"{BASE_URL}/api/auth/verify-email-otp",
            json=verify_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert verify_resp.status_code == 200, f"Verify OTP failed: {verify_resp.text}"

        json_resp = verify_resp.json()
        assert "token" in json_resp, "JWT token not found in response"
        token = json_resp["token"]
        assert isinstance(token, str) and len(token) > 0, "Invalid JWT token"

    except requests.Timeout:
        assert False, "Request timed out"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_verify_otp_and_login_success()