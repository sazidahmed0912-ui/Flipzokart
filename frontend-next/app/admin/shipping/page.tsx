import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminShipping as Component } from '@/app/_pages/AdminShipping';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
