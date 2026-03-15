export function generateStaticParams() {
  return [{ slug: '1' }]; // Fallback ID for static export
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
