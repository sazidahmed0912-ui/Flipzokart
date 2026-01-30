import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminUsers as Component } from '@/app/_pages/AdminUsers/AdminUsers';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
