
const getProductImageUrl = (imagePath?: string): string => {
    if (!imagePath) return "https://via.placeholder.com/300?text=No+Image";
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    const API_URL = 'http://localhost:5000';
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    return `${API_URL}/${cleanPath}`;
};

const simulateGallery = (product: any) => {
    console.log("--- Simulating Product:", product?.name, "---");

    if (!product) {
        console.log("No product");
        return;
    }

    let galleryImgs: string[] = [];

    // STRICT logic from component
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        galleryImgs = product.images.map((img: string) => getProductImageUrl(img));
    }

    const uniqueSet = new Set<string>();
    galleryImgs.forEach(img => {
        if (img && img !== "/placeholder.png") uniqueSet.add(img);
    });

    let finalGallery = Array.from(uniqueSet);

    if (finalGallery.length === 0) {
        if (product.thumbnail) {
            finalGallery = [getProductImageUrl(product.thumbnail)];
        } else {
            finalGallery = ["/placeholder.png"];
        }
    }

    console.log("Resulting Gallery:", finalGallery);
    console.log("Length:", finalGallery.length);
    if (finalGallery.length > 1) {
        console.log("Thumbnails/Arrows: VISIBLE");
    } else {
        console.log("Thumbnails/Arrows: HIDDEN");
    }
};

// Scenarios
const productTarget = {
    name: "Target Case (5 images)",
    images: ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg"],
    image: "legacy.jpg" // Should be ignored
};

const productLegacyOnly = {
    name: "Legacy Only (Should fail to placeholder)",
    image: "legacy.jpg" // Should be ignored
    // images undefined
};

const productEmptyArray = {
    name: "Empty Array",
    images: [] // Should fail to placeholder
};

const productMixedDuplicates = {
    name: "Mixed Duplicates",
    images: ["img1.jpg", "img1.jpg", "img2.jpg"]
};

simulateGallery(productTarget);
simulateGallery(productLegacyOnly);
simulateGallery(productEmptyArray);
simulateGallery(productMixedDuplicates);
