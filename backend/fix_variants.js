const axios = require('axios');

const PRODUCT_ID = '697e209c249ce33a255c474e';

// 1. RICH Variants (for Metadata/Admin)
const RICH_VARIANTS = [
    {
        id: "v1",
        name: "Size",
        options: [
            { id: "o1", name: "S" },
            { id: "o2", name: "M" },
            { id: "o3", name: "L" },
            { id: "o4", name: "XL" }
        ]
    },
    {
        id: "v2",
        name: "Color",
        options: [
            { id: "c1", name: "Red", color: "#FF0000" }, // Red
            { id: "c2", name: "Blue", color: "#0000FF" }, // Blue
            { id: "c3", name: "Black", color: "#000000" }
        ]
    }
];

// 2. SIMPLE Variants (for DB Schema)
// Mongoose expects: { name: String, options: [String] }
const DB_VARIANTS = RICH_VARIANTS.map(v => ({
    name: v.name,
    options: v.options.map(o => o.name)
}));

const METADATA = {
    sku: "FZK-FIXED",
    gallery: ["/uploads/image-1769873548061.jpeg"],
    specifications: "Material: Cotton\nFit: Regular",
    variants: RICH_VARIANTS, // Store rich data in meta
    matrix: [],
    section: { title: "", color: "#111827", size: "text-xl" }
};

const runFix = async () => {
    try {
        console.log(`🚀 Fixing Product ${PRODUCT_ID}...`);

        const current = await axios.get(`http://localhost:5000/api/products/${PRODUCT_ID}`);
        let descBase = current.data.description || "";
        if (descBase.includes('<!-- METADATA:')) {
            descBase = descBase.split('<!-- METADATA:')[0];
        }

        const payload = {
            variants: DB_VARIANTS, // <--- Correct Schema Structure
            images: ["/uploads/image-1769873548061.jpeg"],
            description: descBase + `\n<!-- METADATA:${JSON.stringify(METADATA)}-->`
        };

        const res = await axios.put(`http://localhost:5000/api/products/${PRODUCT_ID}`, payload);

        console.log("✅ Update Success:", res.status);
        console.log("Updated Variants Count:", res.data.data.product.variants.length);

    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
    }
};

runFix();
