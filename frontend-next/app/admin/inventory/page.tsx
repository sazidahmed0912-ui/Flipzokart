import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminInventory as Component } from '@/app/_pages/AdminProducts/AdminInventory';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
