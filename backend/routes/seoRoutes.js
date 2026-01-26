const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
// const { format } = require('date-fns'); // Removed to avoid dependency error, using native Date.toISOString()

// Helper to escape XML special characters
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

const BASE_URL = 'https://fzokart.com';

/* -------------------------------------------------------------------------- */
/*                                1️⃣ SITEMAP.XML                              */
/* -------------------------------------------------------------------------- */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, published: true })
            .select('slug updatedAt')
            .lean();

        // XML Header
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // 1. Static Pages
        const staticPages = [
            '',
            '/shop',
            '/about',
            '/contact',
            '/privacy-policy',
            '/terms-of-service',
            '/return-policy',
            '/auth/login',
            '/auth/register'
        ];

        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        // 2. Dynamic Product Pages
        products.forEach(product => {
            // Support both slug and ID based URLs if needed, but slug is preferred for SEO
            // Assuming frontend uses /product/:id but user requested SEO optimization
            // If frontend uses ID, we use ID. If slug, slug. The prompt says "Optimize".
            // Let's use the ID for guaranteed match with current routes, or slug if available in App.tsx routes.
            // Current App.tsx uses /product/:id. So we MUST use ID or change frontend.
            // RULES say "Do NOT break existing APIs/Logic". So we link to /product/:id.
            // Note: Product Schema has slug, but App.tsx uses :id.
            // We use /product/${product._id} to be safe.

            const url = `${BASE_URL}/product/${product._id}`;
            const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();

            xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Sitemap Generation Error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

/* -------------------------------------------------------------------------- */
/*                             2️⃣ PRODUCT-FEED.XML                            */
/* -------------------------------------------------------------------------- */
router.get('/product-feed.xml', async (req, res) => {
    try {
        // Fetch products with all details needed for Google Merchant Center
        const products = await Product.find({ isActive: true, published: true })
            .select('_id name description price image images countInStock category brand updatedAt')
            .lean();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Flipzokart Products</title>
  <link>${BASE_URL}</link>
  <description>Best Online Shopping Site for Fashion, Electronics, Home &amp; More</description>`;

        products.forEach(product => {
            const link = `${BASE_URL}/product/${product._id}`;
            const imageLink = product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : '';
            const price = `${product.price} INR`;
            const stock = product.countInStock > 0 ? 'in_stock' : 'out_of_stock';

            // Clean Description
            const description = escapeXml(product.description || product.name);
            const title = escapeXml(product.name);
            const brand = escapeXml(product.brand || 'Flipzokart');
            const category = escapeXml(product.category || 'General');

            xml += `
  <item>
    <g:id>${product._id}</g:id>
    <g:title>${title}</g:title>
    <g:description>${description}</g:description>
    <g:link>${link}</g:link>
    <g:image_link>${imageLink}</g:image_link>
    <g:condition>new</g:condition>
    <g:availability>${stock}</g:availability>
    <g:price>${price}</g:price>
    <g:brand>${brand}</g:brand>
    <g:google_product_category>${category}</g:google_product_category>
  </item>`;
        });

        xml += `
</channel>
</rss>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Product Feed Error:', error);
        res.status(500).send('Error generating product feed');
    }
});

/* -------------------------------------------------------------------------- */
/*                             3️⃣ IMAGE-SITEMAP.XML                           */
/* -------------------------------------------------------------------------- */
router.get('/image-sitemap.xml', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, published: true })
            .select('_id name image images')
            .lean();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        products.forEach(product => {
            const productUrl = `${BASE_URL}/product/${product._id}`;
            const title = escapeXml(product.name);

            // Main Image
            let imagesXml = '';
            if (product.image) {
                const imgUrl = product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`;
                imagesXml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${title}</image:title>
    </image:image>`;
            }

            // Gallery Images
            if (product.images && Array.isArray(product.images)) {
                product.images.forEach(img => {
                    // Check duplicates
                    if (img !== product.image) {
                        const imgUrl = img.startsWith('http') ? img : `${BASE_URL}${img}`;
                        imagesXml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
    </image:image>`;
                    }
                });
            }

            if (imagesXml) {
                xml += `
  <url>
    <loc>${productUrl}</loc>${imagesXml}
  </url>`;
            }
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Image Sitemap Error:', error);
        res.status(500).send('Error generating image sitemap');
    }
});

/* -------------------------------------------------------------------------- */
/*                          4️⃣ SITE VERIFICATION XML                          */
/* -------------------------------------------------------------------------- */
// Dynamic verification handler to avoid creating files in root
router.get('/google:code.xml', (req, res) => {
    const code = req.params.code; // Capture the verification code from URL
    // You can validate 'code' against a config if needed, or just return basic google-site-verification content

    // Standard Google Verification content
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<site_verification_file>
<verification_code>${code}</verification_code>
</site_verification_file>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

module.exports = router;
