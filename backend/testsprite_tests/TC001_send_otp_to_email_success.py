import requests

def test_send_otp_to_email_success():
    base_url = "http://localhost:5000"
    endpoint = "/api/auth/send-email-otp"
    url = base_url + endpoint
    headers = {"Content-Type": "application/json"}
    payload = {"email": "test.user@example.com"}
    timeout_seconds = 30

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout_seconds)
    except requests.Timeout:
        assert False, "Request timed out while sending OTP to email"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    # The response body is unspecified for success, assume empty or any content is success.
    # If there is a specific success field, we could check here, but per PRD only status 200 is defined.

test_send_otp_to_email_success()