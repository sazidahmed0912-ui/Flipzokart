import { Suspense } from 'react';
import { TrackOrderPage as Component } from '@/app/_pages/TrackOrderPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Component />
    </Suspense>
  );
}
