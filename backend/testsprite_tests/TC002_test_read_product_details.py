import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_read_product_details():
    # First create a product to ensure a valid product ID for read test
    product_payload = {
        "name": "Test Product",
        "description": "A product created for testing read functionality.",
        "price": 19.99,
        "images": [
            {
                "url": "http://example.com/image1.jpg",
                "altText": "Test Image 1"
            }
        ],
        "category": "Test Category",
        "stock": 10
    }
    product_id = None

    try:
        # Create product
        create_resp = requests.post(
            f"{BASE_URL}/products",
            json=product_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Expected 201 Created but got {create_resp.status_code}"
        create_data = create_resp.json()
        assert "id" in create_data or "_id" in create_data, "Product creation response missing product ID"
        product_id = create_data.get("id") or create_data.get("_id")
        assert product_id is not None, "Product ID is None"

        # Read product details by product_id
        read_resp = requests.get(
            f"{BASE_URL}/products/{product_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert read_resp.status_code == 200, f"Expected 200 OK but got {read_resp.status_code}"
        product_data = read_resp.json()

        # Assert all product info is present
        expected_fields = ["id", "_id", "name", "description", "price", "images", "category", "stock"]
        # product_data may have either "id" or "_id" so check at least one present
        assert any(field in product_data for field in ["id", "_id"]), "Missing product ID in read response"

        for field in ["name", "description", "price", "category", "stock"]:
            assert field in product_data, f"Missing field '{field}' in product details"

        # Check images field exists and is a list
        assert "images" in product_data, "'images' field is missing in product details"
        images = product_data["images"]
        assert isinstance(images, list), "'images' field is not a list"

        # Check images array is correctly populated (at least one image with required fields)
        assert len(images) > 0, "'images' array is empty"
        for image in images:
            assert isinstance(image, dict), "Image item is not a dictionary"
            assert "url" in image and isinstance(image["url"], str) and image["url"], "Image missing valid 'url'"
            assert "altText" in image and isinstance(image["altText"], str), "Image missing 'altText'"

    finally:
        if product_id:
            # Cleanup: delete the created product
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/products/{product_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # It's okay if product was already deleted or not found, ignore errors here
            except Exception:
                pass

test_read_product_details()