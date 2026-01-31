
const axios = require('axios');

const TEST_PRODUCT = {
    name: "TestSprite Metadata Unpack Check",
    price: 999,
    originalPrice: 1200,
    image: "legacy-image.jpg",
    category: "Test",
    countInStock: 10,
    // Simulate Admin Panel Metadata Packing
    description: `This is a test description.
<!-- METADATA:{"sku":"TEST-SKU","gallery":["img1.jpg","img2.jpg"],"specifications":"Color:Blue","variants":[{"name":"Size","options":["S","M"]}],"matrix":[]}-->`
};

const runTest = async () => {
    try {
        console.log("🚀 Sending Payload with Metadata...");
        const res = await axios.post('http://localhost:5000/api/products/add', TEST_PRODUCT);

        if (res.data && res.data.data && res.data.data.product) {
            const p = res.data.data.product;
            console.log("✅ Product Created:", p._id);

            console.log("--- Verification ---");
            console.log("Top-level Images:", p.images); // Should be ["img1.jpg", "img2.jpg"]
            console.log("Top-level Variants:", JSON.stringify(p.variants)); // Should be populated

            if (p.images && p.images.length === 2 && p.images[0] === 'img1.jpg') {
                console.log("🎉 SUCCESS: Metadata unpacked into 'images' array!");
            } else {
                console.error("❌ FAILURE: 'images' array is empty or incorrect.");
            }

            if (p.variants && p.variants.length > 0) {
                console.log("🎉 SUCCESS: Metadata unpacked into 'variants' array!");
            } else {
                console.error("❌ FAILURE: 'variants' array is empty.");
            }

        } else {
            console.error("❌ Failed to create product", res.data);
        }

    } catch (error) {
        console.error("❌ Error:", error.response ? error.response.data : error.message);
    }
};

runTest();
