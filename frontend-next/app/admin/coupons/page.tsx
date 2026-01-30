import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminCoupons as Component } from '@/app/_pages/AdminCoupons';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
