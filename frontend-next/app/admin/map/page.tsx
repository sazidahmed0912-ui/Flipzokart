import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminMap as Component } from '@/app/_pages/AdminMap';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
