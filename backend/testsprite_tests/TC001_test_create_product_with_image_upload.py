import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
PRODUCTS_ENDPOINT = f"{BASE_URL}/products"

def test_create_product_with_image_upload():
    # Prepare product data
    product_data = {
        "name": "Test Product",
        "description": "A product created for testing image upload.",
        "price": 19.99,
        "category": "Test Category"
    }
    # Prepare image file to upload
    # For the purpose of this test, we simulate an image file with bytes
    image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00"
    files = {
        "image": ("test_image.png", image_content, "image/png")
    }
    # Fields data will be sent as form-data with files in multipart request
    # merge product_data into the data field for multipart/form-data request
    data = {
        "name": product_data["name"],
        "description": product_data["description"],
        "price": str(product_data["price"]),
        "category": product_data["category"]
    }
    created_product_id = None

    try:
        response = requests.post(
            PRODUCTS_ENDPOINT,
            data=data,
            files=files,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        resp_json = response.json()

        # Check basic product fields existence
        assert resp_json.get("name") == product_data["name"], "Product name mismatch"
        assert resp_json.get("description") == product_data["description"], "Product description mismatch"
        assert float(resp_json.get("price", 0)) == product_data["price"], "Product price mismatch"
        assert resp_json.get("category") == product_data["category"], "Product category mismatch"

        # Verify the 'images' array field is present and populated
        images = resp_json.get("images")
        assert isinstance(images, list), "'images' field is not a list"
        assert len(images) > 0, "'images' array is empty"
        # Each image object should have at least a URL or ID, check first entry
        first_image = images[0]
        assert isinstance(first_image, dict), "Each image entry should be a dict"
        assert any(key in first_image for key in ["url", "id", "filename"]), "Image object missing expected keys"

        # Save product ID for cleanup
        created_product_id = resp_json.get("id") or resp_json.get("_id")
        assert created_product_id, "Created product ID not found in response"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        # Cleanup - delete the created product if it exists
        if created_product_id:
            try:
                del_response = requests.delete(
                    f"{PRODUCTS_ENDPOINT}/{created_product_id}",
                    timeout=TIMEOUT
                )
                # Allow 200-299 range status for deletion success
                assert del_response.status_code >= 200 and del_response.status_code < 300, \
                    f"Failed to delete product during cleanup, status code: {del_response.status_code}"
            except requests.exceptions.RequestException:
                pass


test_create_product_with_image_upload()