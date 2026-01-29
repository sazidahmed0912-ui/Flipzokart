import os
import requests
import smtplib
import socket
import time
from email.message import EmailMessage

BASE_URL = "http://localhost:5000"
SMTP_HOST = "smtp.zoho.in"
SMTP_PORT = 465
SMTP_TIMEOUT = 10

# Retrieve necessary environment variables for Zoho OAuth2 SMTP
ZOHO_SMTP_EMAIL = os.getenv("ZOHO_SMTP_EMAIL")
ZOHO_SMTP_OAUTH2_ACCESS_TOKEN = os.getenv("ZOHO_SMTP_OAUTH2_ACCESS_TOKEN")

def test_email_service_integration_with_zoho_oauth2_smtp():
    assert ZOHO_SMTP_EMAIL, "Environment variable ZOHO_SMTP_EMAIL is not set"
    assert ZOHO_SMTP_OAUTH2_ACCESS_TOKEN, "Environment variable ZOHO_SMTP_OAUTH2_ACCESS_TOKEN is not set"

    # Verify direct socket connection to smtp.zoho.in on port 465
    try:
        with socket.create_connection((SMTP_HOST, SMTP_PORT), timeout=SMTP_TIMEOUT):
            pass
    except socket.timeout:
        assert False, f"Timed out connecting to {SMTP_HOST}:{SMTP_PORT}"
    except Exception as e:
        assert False, f"Failed to connect to {SMTP_HOST}:{SMTP_PORT} due to: {e}"

    # Compose email payload for API request
    test_email_payload = {
        "to": ZOHO_SMTP_EMAIL,
        "subject": "Test Email Service Integration",
        "text": "This is a test email to verify Zoho OAuth2 SMTP integration."
    }

    headers = {
        "Content-Type": "application/json"
    }

    # Send email via the application's email sending endpoint
    # Assume POST /email/send is the endpoint to send emails
    # We do not have explicit API doc for the endpoint, assuming common pattern
    try:
        response = requests.post(
            f"{BASE_URL}/email/send",
            json=test_email_payload,
            headers=headers,
            timeout=30
        )
    except requests.exceptions.RequestException as e:
        assert False, f"Email service request failed with exception: {e}"

    # Validate response status code for success
    assert response.status_code in (200, 202), (
        f"Expected status 200 or 202, got {response.status_code}. Response: {response.text}"
    )

    # Validate response body presence and content typical for success or known error
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check for errors related to SMTP authentication or timeout in response
    error = resp_json.get("error") or resp_json.get("message")
    if error:
        # If error mentions ETIMEDOUT or auth issues, fail test
        err_lower = str(error).lower()
        assert "etimedout" not in err_lower, f"ETIMEDOUT error encountered: {error}"
        assert "authentication" not in err_lower and "auth" not in err_lower, f"Authentication error encountered: {error}"

    # If present, check a success indicator in response
    success_indicators = ["success", "sent", "queued"]
    response_text = str(resp_json).lower()
    assert any(indicator in response_text for indicator in success_indicators), (
        f"Response does not indicate success: {resp_json}"
    )


test_email_service_integration_with_zoho_oauth2_smtp()