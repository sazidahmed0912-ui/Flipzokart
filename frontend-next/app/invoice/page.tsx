import { Suspense } from 'react';
import { InvoicePage as Component } from '@/app/_pages/InvoicePage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Component />
    </Suspense>
  );
}
