import os
import requests
import json

def test_email_service_integration_with_zoho_mail_rest_api():
    base_url = "http://localhost:5000"
    email_send_endpoint = f"{base_url}/email/send"  # Assuming this endpoint triggers sending email via Zoho Mail REST API

    # Prepare email payload
    payload = {
        "to": "recipient@example.com",
        "subject": "Test Email from Zoho Mail REST API",
        "body": "This is a test email sent via Zoho Mail REST API integration."
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Check for presence of Zoho OAuth token environment variable to determine real or mocked test
    zoho_oauth_token = os.getenv("ZOHO_OAUTH_TOKEN")

    try:
        # Send email request to local email service
        response = requests.post(email_send_endpoint, headers=headers, data=json.dumps(payload), timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        # If network or request error, assert failure and message
        assert False, f"Request to email sending service failed: {e}"

    resp_json = {}
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate Zoho API response structure and success status
    # According to Zoho Mail API docs, success returns HTTP 200 with JSON containing 'status' or 'code' fields.
    # Since we are testing via local email service, that internally uses Zoho REST API via Axios:
    # We'll assume the response JSON includes a 'zohoResponse' field that mirrors Zoho API raw response
    assert "zohoResponse" in resp_json, "Response JSON missing 'zohoResponse' key"
    zoho_resp = resp_json["zohoResponse"]
    assert isinstance(zoho_resp, dict), "'zohoResponse' should be a dictionary"

    # Check for typical Zoho Mail API success indicator, e.g. status=200 or code=200
    status_code = zoho_resp.get("status") or zoho_resp.get("code") or zoho_resp.get("statusCode")
    assert status_code == 200, f"Zoho API did not return status 200, got: {status_code}"

    # Also check no auth errors in the response
    errors = zoho_resp.get("errors") or []
    assert not errors, f"Zoho API returned errors: {errors}"

    # In case of token not set, the service should handle gracefully without crashing
    if not zoho_oauth_token:
        # If token is missing, the service should respond with a clear error but handle gracefully
        # In that case, ensure the response has an error message related to auth failure
        if status_code != 200:
            err_msg = zoho_resp.get("message") or zoho_resp.get("error_description") or ""
            assert "auth" in err_msg.lower() or "token" in err_msg.lower(), "Expected auth failure message missing"


test_email_service_integration_with_zoho_mail_rest_api()