import { ProtectedRoute } from '@/app/components/RouteGuards';
import Component from '@/app/_pages/SecurityPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
}
