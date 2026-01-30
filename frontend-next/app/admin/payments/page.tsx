import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminPayments as Component } from '@/app/_pages/AdminPayments';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
