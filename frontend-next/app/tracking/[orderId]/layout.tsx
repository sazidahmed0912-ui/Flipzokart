export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
    const res = await fetch(`${apiUrl}/api/order/admin/all`, { cache: 'no-store' });
    if (!res.ok) return [{ orderId: 'fallback' }];
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.data || json.orders || [];
    if (!items.length) return [{ orderId: 'fallback' }];
    return items.map((o: any) => ({ orderId: String(o._id || o.id) }));
  } catch {
    return [{ orderId: 'fallback' }];
  }
}


export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
