import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminInvoices as Component } from '@/app/_pages/AdminInvoices';

export default function Page() {
  return (
    <AdminRoute>
      <Component />
    </AdminRoute>
  );
}
