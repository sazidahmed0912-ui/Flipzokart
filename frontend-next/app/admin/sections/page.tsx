import { AdminRoute } from '@/app/components/RouteGuards';
import { AdminSections as Component } from '@/app/_pages/AdminSections';

export default function Page() {
    return (
        <AdminRoute>
            <Component />
        </AdminRoute>
    );
}
