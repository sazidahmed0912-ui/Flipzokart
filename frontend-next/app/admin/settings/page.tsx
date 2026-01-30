import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminSettings as Component } from '@/app/_pages/AdminSettings/AdminSettings';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
