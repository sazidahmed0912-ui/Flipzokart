import { InvoicePage as Component } from '@/app/_pages/InvoicePage';

export default function Page() {
  return <Component />;
}


export function generateStaticParams() {
  return [{ orderId: '1' }]; // Fallback ID for static export
}
