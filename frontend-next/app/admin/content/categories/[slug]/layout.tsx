export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com';
    const res = await fetch(`${apiUrl}/api/content/categories`, { cache: 'no-store' });
    if (!res.ok) return [{ slug: 'fallback' }];
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.data || [];
    if (!items.length) return [{ slug: 'fallback' }];
    return items.map((c: any) => ({ slug: String(c.slug || c._id || c.id) }));
  } catch {
    return [{ slug: 'fallback' }];
  }
}


export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
