import { ProductDetails as Component } from '@/app/_pages/ProductDetails';

export default function Page() {
  return <Component />;
}

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
    const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Handle both { data: [...] } and [...] response shapes
    const products: { _id?: string; id?: string }[] = Array.isArray(json)
      ? json
      : json.data?.products || json.data || json.products || [];

    if (products.length === 0) throw new Error('No products returned');

    return products.map((p) => ({ id: String(p._id || p.id) }));
  } catch (err) {
    console.warn('[generateStaticParams] Failed to fetch products, using fallback:', err);
    // Fallback: at least build ONE valid product page so the build doesn't fail
    return [{ id: 'fallback' }];
  }
}

