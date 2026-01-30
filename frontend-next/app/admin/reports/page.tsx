import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminReports as Component } from '@/app/_pages/AdminReports/AdminReports';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
