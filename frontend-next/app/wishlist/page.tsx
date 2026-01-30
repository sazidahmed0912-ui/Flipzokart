import { ProtectedRoute } from '@/app/components/RouteGuards';
import { WishlistPage as Component } from '@/app/_pages/WishlistPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
}
