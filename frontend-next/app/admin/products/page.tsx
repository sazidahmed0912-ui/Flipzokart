import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminProducts as Component } from '@/app/_pages/AdminProducts/AdminProducts';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
