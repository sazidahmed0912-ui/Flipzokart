import requests
import hashlib
import hmac
import json

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
RAZORPAY_KEY_SECRET = "test_secret"
HEADERS = {"Content-Type": "application/json"}

def generate_signature(order_id, payment_id, secret):
    msg = f"{order_id}|{payment_id}"
    signature = hmac.new(
        key=secret.encode('utf-8'),
        msg=msg.encode('utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()
    return signature

def test_verify_razorpay_payment_signature():
    razorpay_order_id = "order_test_123"
    razorpay_payment_id = "pay_test_456"
    valid_signature = generate_signature(razorpay_order_id, razorpay_payment_id, RAZORPAY_KEY_SECRET)

    # Test valid signature
    payload_valid = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": valid_signature
    }
    try:
        response_valid = requests.post(f"{BASE_URL}/api/order/verify-payment", headers=HEADERS, json=payload_valid, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for valid signature test: {e}"
    assert response_valid.status_code == 200, f"Expected 200 for valid signature but got {response_valid.status_code}"
    try:
        data_valid = response_valid.json()
    except json.JSONDecodeError:
        assert False, "Response is not valid JSON for valid signature"
    assert "success" in data_valid.get("message", "").lower(), f"Success message not found in valid signature response: {data_valid}"

    # Test invalid signature
    payload_invalid = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": "invalid_signature"
    }
    try:
        response_invalid = requests.post(f"{BASE_URL}/api/order/verify-payment", headers=HEADERS, json=payload_invalid, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for invalid signature test: {e}"
    assert response_invalid.status_code == 400, f"Expected 400 for invalid signature but got {response_invalid.status_code}"
    try:
        data_invalid = response_invalid.json()
    except json.JSONDecodeError:
        assert False, "Response is not valid JSON for invalid signature"
    err_msg = data_invalid.get("error") or data_invalid.get("message") or ""
    assert err_msg, f"No error message in invalid signature response: {data_invalid}"

    # Test server error simulation (e.g., sending malformed payload)
    payload_error = {
        "razorpay_order_id": None,
        "razorpay_payment_id": None,
        "razorpay_signature": None
    }
    try:
        response_error = requests.post(f"{BASE_URL}/api/order/verify-payment", headers=HEADERS, json=payload_error, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for server error simulation test: {e}"
    # Allow either 500 or error-like status due to server error
    assert response_error.status_code == 500, f"Expected 500 for server error simulation but got {response_error.status_code}"

test_verify_razorpay_payment_signature()