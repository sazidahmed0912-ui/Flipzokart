
const axios = require('axios');

const checkAll = async () => {
    try {
        console.log(`🔍 Fetching ALL Products...`);
        const res = await axios.get(`http://localhost:5000/api/products`);
        const products = res.data;

        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            // Find a product with metadata to check
            const pWithMeta = products.find(p => p.description && p.description.includes('<!-- METADATA:'));

            const p = pWithMeta || products[0];
            console.log("--- Inspecting Product ---");
            console.log("ID:", p._id);
            console.log("Name:", p.name);
            console.log("Image (Legacy):", p.image);
            console.log("Images (Array):", p.images);
            console.log("Variants:", JSON.stringify(p.variants));
            if (p.description?.includes('<!-- METADATA:')) {
                console.log("Has Metadata: YES");
                console.log("Meta:", p.description.split('<!-- METADATA:')[1].split('-->')[0]);
            } else {
                console.log("Has Metadata: NO");
            }
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
};

checkAll();
