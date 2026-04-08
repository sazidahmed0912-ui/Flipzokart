import { Suspense } from 'react';
import { TrackOrderPage as Component } from '@/app/_pages/TrackOrderPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Component />
    </Suspense>
  );
}


export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
    const res = await fetch(`${apiUrl}/api/order/admin/all`, { cache: 'no-store' });
    if (!res.ok) return [{ trackingId: 'fallback' }];
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.data || json.orders || [];
    if (!items.length) return [{ trackingId: 'fallback' }];
    // Some tracking systems use the order ID as tracking ID
    return items.map((o: any) => ({ trackingId: String(o._id || o.id) }));
  } catch {
    return [{ trackingId: 'fallback' }];
  }
}

