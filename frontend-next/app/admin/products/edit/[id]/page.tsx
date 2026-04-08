import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminProductEditor as Component } from '@/app/_pages/AdminProducts/AdminProductEditor';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}


export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
    const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [{ id: 'fallback' }];
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.data?.products || json.data || json.products || [];
    if (!items.length) return [{ id: 'fallback' }];
    return items.map((p: any) => ({ id: String(p._id || p.id) }));
  } catch {
    return [{ id: 'fallback' }];
  }
}
