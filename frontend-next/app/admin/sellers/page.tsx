import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminSellers as Component } from '@/app/_pages/AdminSellers';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
