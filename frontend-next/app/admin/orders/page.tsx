import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminOrders as Component } from '@/app/_pages/AdminOrders/AdminOrders';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
