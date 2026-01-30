import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminOrderDetails as Component } from '@/app/_pages/AdminOrders/AdminOrderDetails';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
