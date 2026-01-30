import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminMonitor as Component } from '@/app/_pages/AdminMonitor';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
