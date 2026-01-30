import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminReviews as Component } from '@/app/_pages/AdminReviews/AdminReviews';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
