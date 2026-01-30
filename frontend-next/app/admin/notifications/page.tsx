import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminNotifications as Component } from '@/app/_pages/AdminNotifications/AdminNotifications';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
