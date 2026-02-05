const axios = require('axios');

async function testNewProductCreation() {
    console.log("🚀 Testing New Product Creation Flow (Axios)...");

    // Payload simulating AdminProductEditor.tsx with the FIXED options map
    const productPayload = {
        name: "Test Product New Admin Algo " + Date.now(),
        description: "This is a test product created to verify variant hydration.",
        price: 999,
        category: "Test Category",
        brand: "Test Brand",
        countInStock: 100,
        // Mock Inventory matrix with OPTIONS map (The Fix)
        inventory: [
            {
                id: "inv-1",
                sku: "TP-RED-S",
                price: 999,
                stock: 10,
                image: "/uploads/image-1770305255280.jpeg",
                options: { "Color": "Red", "Size": "S" } // CRITICAL: The options map
            },
            {
                id: "inv-2",
                sku: "TP-RED-M",
                price: 1099,
                stock: 5,
                image: "/uploads/image-1770305255280.jpeg",
                options: { "Color": "Red", "Size": "M" }
            }
        ],
        // Mock Variant Groups (used by frontend but not strictly backend logic for hydration usually)
        variantGroups: [
            {
                id: "vg-1",
                name: "Color",
                options: [{ id: "opt-1", name: "Red", value: "#FF0000" }]
            },
            {
                id: "vg-2",
                name: "Size",
                options: [{ id: "opt-2", name: "S" }, { id: "opt-3", name: "M" }]
            }
        ]
    };

    // 1. Create Product
    console.log("POST /api/products...");
    try {
        // Try creating without auth (often dev env allows this or we need token)
        // If this 401s, we need a token.
        // For now, attempting direct creation.
        const res = await axios.post('http://localhost:5000/api/products', productPayload);

        const productId = res.data._id || res.data.id || res.data.product._id;
        console.log(`✅ Product Created: ${productId}`);

        // 2. Fetch Product (Hydration Check)
        console.log(`GET /api/products/${productId}...`);
        const readRes = await axios.get(`http://localhost:5000/api/products/${productId}`);
        const fetchedProduct = readRes.data;

        console.log("📦 Fetched Product Data:");
        console.log(`Name: ${fetchedProduct.name}`);
        console.log(`Variants Count: ${fetchedProduct.variants?.length}`);

        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
            console.log("✅ Variants found! Inspecting first variant:");
            console.log(JSON.stringify(fetchedProduct.variants[0], null, 2));
        } else {
            console.error("❌ NO VARIANTS FOUND! Hydration Logic might be failing.");
        }

        // 3. Inspect Home Page compatibility fields
        console.log("\n🏠 Home Page Checks:");
        console.log(`CountInStock: ${fetchedProduct.countInStock}`);
        console.log(`Image: ${fetchedProduct.image || fetchedProduct.images?.[0]}`);
        console.log(`Price: ${fetchedProduct.price}`);

    } catch (err) {
        console.error("❌ Request Failed Details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
        });
        if (err.response?.status === 401) {
            console.log("🔒 Auth required.");
        }
    }
}

testNewProductCreation();
