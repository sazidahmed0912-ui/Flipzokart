import requests
import json

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
HEADERS = {'Content-Type': 'application/json'}


def test_email_service_integration_with_zoho_oauth2_smtp():
    send_email_endpoint = f"{BASE_URL}/email/send"
    # Construct a valid email payload to trigger Zoho OAuth2 SMTP via Nodemailer
    email_payload = {
        "to": "testrecipient@example.com",
        "subject": "Integration Test Email",
        "text": "This is a test email sent using Zoho OAuth2 SMTP via Nodemailer.",
        "html": "<p>This is a test email sent using Zoho OAuth2 SMTP via Nodemailer.</p>"
    }

    try:
        response = requests.post(send_email_endpoint, headers=HEADERS, json=email_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to send email failed: {e}"

    # The expected success status code is assumed 200; adjust if API differs
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        resp_json = response.json()
    except json.JSONDecodeError:
        assert False, "Response is not in JSON format"

    # Validate response contains success indication and no auth error
    # Assuming API returns {"success": true, "message": "..."} or error info
    assert "success" in resp_json, "Response JSON missing 'success' key"
    assert resp_json["success"] is True, f"Email sending was not successful: {resp_json}"

    # Validate no authentication error messages in response
    # Commonly error messages might be inside a "message" or "error" field
    error_fields = ["message", "error", "errors"]
    auth_error_keywords = ["authentication failed", "auth error", "invalid credentials", "oauth2 error", "authentication error"]

    for field in error_fields:
        if field in resp_json:
            msg = str(resp_json[field]).lower()
            for keyword in auth_error_keywords:
                assert keyword not in msg, f"Authentication error detected in response message: '{resp_json[field]}'"

    # Testing failure handling: send invalid payload to provoke failure
    invalid_payload = {
        "to": "invalid-email-address",
        "subject": "Invalid Test Email",
        "text": "This email should fail due to invalid recipient."
    }

    try:
        fail_response = requests.post(send_email_endpoint, headers=HEADERS, json=invalid_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to send email with invalid payload failed: {e}"

    # Expect a 4xx client error for invalid input
    assert 400 <= fail_response.status_code < 500, f"Expected 4xx client error for invalid payload, got {fail_response.status_code}"

    try:
        fail_resp_json = fail_response.json()
    except json.JSONDecodeError:
        assert False, "Failure response is not in JSON format"

    # Validate error is handled gracefully with error message
    assert "success" in fail_resp_json, "Failure response JSON missing 'success' key"
    assert fail_resp_json["success"] is False or fail_resp_json.get("error") is not None, (
        "Failure response does not properly indicate error"
    )


test_email_service_integration_with_zoho_oauth2_smtp()