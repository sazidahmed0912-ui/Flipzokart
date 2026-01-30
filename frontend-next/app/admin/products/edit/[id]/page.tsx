import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminProductEditor as Component } from '@/app/_pages/AdminProducts/AdminProductEditor';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
