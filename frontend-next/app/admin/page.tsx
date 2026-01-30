import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminDashboard as Component } from '@/app/_pages/AdminDashboard';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
