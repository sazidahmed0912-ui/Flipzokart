import { ProtectedRoute } from '@/app/components/RouteGuards';
import { CustomerDashboard as Component } from '@/app/_pages/CustomerDashboard';

export default function Page() {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
}
