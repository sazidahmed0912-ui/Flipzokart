import requests
import io

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
HEADERS = {
    # Assuming no auth is required; if required, include here
    # Example: "Authorization": "Bearer <token>"
}

def test_update_product_information_and_image():
    # Step 1: Create a product to update
    create_url = f"{BASE_URL}/products"
    product_data = {
        "name": "Test Product",
        "description": "Initial description",
        "price": "10.99",
        "category": "Test Category"
    }
    image_content = io.BytesIO(b"initial image content")
    files = {
        "images": ("initial_image.jpg", image_content, "image/jpeg")
    }

    create_resp = requests.post(create_url, headers=HEADERS, data=product_data, files=files, timeout=TIMEOUT)
    assert create_resp.status_code == 201, f"Failed to create product: {create_resp.text}"
    created_product = create_resp.json()
    product_id = created_product.get("_id") or created_product.get("id")
    assert product_id, "Created product ID not returned"
    assert "images" in created_product and isinstance(created_product["images"], list), "'images' array missing or incorrect in create response"
    assert len(created_product["images"]) >= 1, "No images found in create response"

    try:
        # Step 2: Update product information and image
        update_url = f"{BASE_URL}/products/{product_id}"
        updated_product_data = {
            "name": "Updated Test Product",
            "description": "Updated description",
            "price": "15.99",
            "category": "Updated Category"
        }
        updated_image_content = io.BytesIO(b"updated image content")
        update_files = {
            "images": ("updated_image.jpg", updated_image_content, "image/jpeg")
        }
        update_resp = requests.put(update_url, headers=HEADERS, data=updated_product_data, files=update_files, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Failed to update product: {update_resp.text}"
        updated_product = update_resp.json()

        # Validate updated fields
        assert updated_product.get("name") == updated_product_data["name"], "Product name not updated"
        assert updated_product.get("description") == updated_product_data["description"], "Product description not updated"
        assert float(updated_product.get("price")) == float(updated_product_data["price"]), "Product price not updated"
        assert updated_product.get("category") == updated_product_data["category"], "Product category not updated"

        # Validate images array
        assert "images" in updated_product and isinstance(updated_product["images"], list), "'images' array missing or incorrect in update response"
        assert any("updated_image.jpg" in (img.get("filename", "") if isinstance(img, dict) else img) for img in updated_product["images"]), "Updated image not found in 'images' array"

        # Step 3: Retrieve product and verify updates are persisted
        get_url = f"{BASE_URL}/products/{product_id}"
        get_resp = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Failed to get product after update: {get_resp.text}"
        gotten_product = get_resp.json()

        # Verify data matches update response
        assert gotten_product.get("name") == updated_product_data["name"], "Persisted product name mismatch"
        assert gotten_product.get("description") == updated_product_data["description"], "Persisted product description mismatch"
        assert float(gotten_product.get("price")) == float(updated_product_data["price"]), "Persisted product price mismatch"
        assert gotten_product.get("category") == updated_product_data["category"], "Persisted product category mismatch"
        assert "images" in gotten_product and isinstance(gotten_product["images"], list), "'images' array missing or incorrect in get response"
        assert any("updated_image.jpg" in (img.get("filename", "") if isinstance(img, dict) else img) for img in gotten_product["images"]), "Updated image not persisted in 'images' array"

    finally:
        # Clean up - delete the created product
        del_url = f"{BASE_URL}/products/{product_id}"
        del_resp = requests.delete(del_url, headers=HEADERS, timeout=TIMEOUT)
        assert del_resp.status_code in (200, 204), f"Failed to delete product: {del_resp.text}"

test_update_product_information_and_image()
