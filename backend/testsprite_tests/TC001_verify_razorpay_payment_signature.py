import os
import requests
import hashlib
import hmac
import json

BASE_URL = "http://localhost:5000"
VERIFY_PAYMENT_ENDPOINT = "/api/order/verify-payment"
TIMEOUT = 30

def test_verify_razorpay_payment_signature():
    secret = os.environ.get("RAZORPAY_KEY_SECRET")
    assert secret, "Environment variable RAZORPAY_KEY_SECRET must be set"

    headers = {
        "Content-Type": "application/json"
    }

    # Sample data for the payment verification request
    razorpay_order_id = "order_9A33XWu170gUtm"
    razorpay_payment_id = "pay_29QQoUBi66xm2f"
    
    # Generate a valid signature
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    valid_signature = hmac.new(
        secret.encode(), msg.encode(), hashlib.sha256
    ).hexdigest()

    # --- Test Case 1: Valid signature ---
    payload_valid = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": valid_signature
    }
    try:
        response = requests.post(
            BASE_URL + VERIFY_PAYMENT_ENDPOINT,
            headers=headers,
            json=payload_valid,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    try:
        resp_json = response.json()
    except json.JSONDecodeError:
        resp_json = {}
    assert (
        ("success" in resp_json.get("message", "").lower()) or ("verified" in resp_json.get("message", "").lower())
    ), f"Unexpected response message: {resp_json.get('message')}"

    # --- Test Case 2: Invalid signature ---
    payload_invalid = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": "invalidsignature1234567890"
    }
    try:
        response = requests.post(
            BASE_URL + VERIFY_PAYMENT_ENDPOINT,
            headers=headers,
            json=payload_invalid,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    try:
        resp_json = response.json()
    except json.JSONDecodeError:
        resp_json = {}
    assert (
        ("invalid" in resp_json.get("message", "").lower()) or ("error" in resp_json.get("message", "").lower())
    ), f"Unexpected response message: {resp_json.get('message')}"

    # --- Test Case 3: Simulate server error ---
    # There is no explicit way in the spec to induce 500 error,
    # so we try sending incomplete data or malformed JSON to trigger server error.
    # Here, send a completely empty body to test server error handling.
    try:
        response = requests.post(
            BASE_URL + VERIFY_PAYMENT_ENDPOINT,
            headers=headers,
            data="",
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # The server may respond with 400 or 500 based on implementation.
    # We assert if status is 500 or handle accordingly.
    if response.status_code != 500:
        # If not 500, try sending malformed JSON to provoke 500
        try:
            response = requests.post(
                BASE_URL + VERIFY_PAYMENT_ENDPOINT,
                headers=headers,
                data="{bad json",
                timeout=TIMEOUT
            )
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

    assert (
        response.status_code == 500
    ), f"Expected 500 but got {response.status_code}"

test_verify_razorpay_payment_signature()