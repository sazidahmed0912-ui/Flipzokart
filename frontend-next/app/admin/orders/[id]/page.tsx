import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminOrderDetails as Component } from '@/app/_pages/AdminOrders/AdminOrderDetails';

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
    const res = await fetch(`${apiUrl}/api/order/admin/all`, { cache: 'no-store' });
    if (!res.ok) return [{ id: 'fallback' }];
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.data || json.orders || [];
    if (!items.length) return [{ id: 'fallback' }];
    return items.map((o: any) => ({ id: String(o._id || o.id) }));
  } catch {
    return [{ id: 'fallback' }];
  }
}

