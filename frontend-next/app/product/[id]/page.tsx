import { ProductDetails as Component } from '@/app/_pages/ProductDetails';

export default function Page() {
  return <Component />;
}


export function generateStaticParams() {
  return [{ id: '1' }]; // Fallback ID for static export
}
