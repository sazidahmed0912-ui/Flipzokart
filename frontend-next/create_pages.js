const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');
const pagesDir = path.join(appDir, '_pages');

// Helper to create directory
const mkdir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Map of Route -> Component Path (relative to _pages)
// Use 'ProtectedRoute' or 'AdminRoute' to wrap
const routes = [
    { path: 'shop', component: 'ShopPage.tsx' },
    { path: 'product/[id]', component: 'ProductDetails.tsx' }, // was ProductDetails/ProductDetails.tsx
    { path: 'cart', component: 'CartPage/CartPage.tsx' },
    { path: 'checkout', component: 'CheckoutPage/CheckoutPage.tsx' },
    { path: 'payment', component: 'PaymentPage/PaymentPage.tsx' },
    { path: 'order-success', component: 'OrderSuccessPage.tsx' },
    { path: 'login', component: 'LoginPage.tsx' },
    { path: 'signup', component: 'SignupPage.tsx' },
    { path: 'forgot-password', component: 'ForgotPassword.tsx' },
    { path: 'reset-password', component: 'ResetPasswordPage.tsx' },
    { path: 'reset-password/[token]', component: 'ResetPasswordPage.tsx' },
    { path: 'profile', component: 'ProfilePage.tsx', guard: 'ProtectedRoute' },
    { path: 'account-security', component: 'SecurityPage.tsx', guard: 'ProtectedRoute' },
    { path: 'wishlist', component: 'WishlistPage.tsx', guard: 'ProtectedRoute' },
    { path: 'dashboard', component: 'CustomerDashboard.tsx', guard: 'ProtectedRoute' },
    { path: 'about', component: 'AboutUsPage.tsx' },
    { path: 'contact', component: 'ContactUsPage.tsx' },
    { path: 'track/[trackingId]', component: 'TrackOrderPage.tsx' },
    { path: 'track-order', component: 'TrackOrderPage.tsx' },
    { path: 'privacy-policy', component: 'PrivacyPolicyPage.tsx' },
    { path: 'terms-of-service', component: 'TermsOfServicePage.tsx' },
    { path: 'help-center', component: 'HelpCenterPage.tsx' },
    { path: 'add-address', component: '../components/AddNewAddress.tsx' },
    { path: 'sell', component: 'SellOnFlipzokart.tsx', guard: 'ProtectedRoute' },
    { path: 'orders', component: 'OrdersPage.tsx', guard: 'ProtectedRoute' },
    { path: 'address-book', component: 'AddressBookPage.tsx', guard: 'ProtectedRoute' },
    { path: 'invoice/[orderId]', component: 'InvoicePage.tsx' },
    { path: 'banned', component: 'BannedPage.tsx' },

    // Admin (using directory structure)
    { path: 'admin', component: 'AdminDashboard.tsx', guard: 'AdminRoute' },
    { path: 'admin/products', component: 'AdminProducts/AdminProducts.tsx', guard: 'AdminRoute' },
    { path: 'admin/inventory', component: 'AdminProducts/AdminInventory.tsx', guard: 'AdminRoute' },
    { path: 'admin/products/new', component: 'AdminProducts/AdminProductEditor.tsx', guard: 'AdminRoute' },
    { path: 'admin/products/edit/[id]', component: 'AdminProducts/AdminProductEditor.tsx', guard: 'AdminRoute' },
    { path: 'admin/orders', component: 'AdminOrders/AdminOrders.tsx', guard: 'AdminRoute' },
    { path: 'admin/orders/[id]', component: 'AdminOrders/AdminOrderDetails.tsx', guard: 'AdminRoute' },
    { path: 'admin/users', component: 'AdminUsers/AdminUsers.tsx', guard: 'AdminRoute' },
    { path: 'admin/monitor', component: 'AdminMonitor.tsx', guard: 'AdminRoute' },
    { path: 'admin/reviews', component: 'AdminReviews/AdminReviews.tsx', guard: 'AdminRoute' },
    { path: 'admin/notifications', component: 'AdminNotifications/AdminNotifications.tsx', guard: 'AdminRoute' },
    { path: 'admin/settings', component: 'AdminSettings/AdminSettings.tsx', guard: 'AdminRoute' },
    { path: 'admin/reports', component: 'AdminReports/AdminReports.tsx', guard: 'AdminRoute' },
    { path: 'admin/sellers', component: 'AdminSellers.tsx', guard: 'AdminRoute' },
    { path: 'admin/coupons', component: 'AdminCoupons.tsx', guard: 'AdminRoute' },
    { path: 'admin/payments', component: 'AdminPayments.tsx', guard: 'AdminRoute' },
    { path: 'admin/invoices', component: 'AdminInvoices.tsx', guard: 'AdminRoute' },
    { path: 'admin/shipping', component: 'AdminShipping.tsx', guard: 'AdminRoute' },
    { path: 'admin/map', component: 'AdminMap.tsx', guard: 'AdminRoute' },
];

routes.forEach(route => {
    const routeDir = path.join(appDir, route.path);
    mkdir(routeDir);

    let importPath = `@/app/_pages/${route.component}`;
    if (route.component.startsWith('../')) {
        importPath = `@/app/${route.component.substring(3)}`;
    }

    // Check if component path has .tsx
    importPath = importPath.replace('.tsx', '');

    let componentName = path.basename(route.component, '.tsx');
    if (componentName === 'index') {
        // If component is index.tsx, take folder name
        componentName = path.basename(path.dirname(route.component));
    }

    let sourceFileStr = route.component;
    if (route.component.startsWith('../')) {
        sourceFileStr = route.component.substring(3); // components/AddNewAddress.tsx
        sourceFileStr = path.join('..', sourceFileStr); // relative to _pages
    }

    let realSourcePath;
    if (route.component.startsWith('../')) {
        realSourcePath = path.join(appDir, route.component.substring(3));
    } else {
        realSourcePath = path.join(pagesDir, route.component);
    }

    if (fs.existsSync(realSourcePath)) {
        const content = fs.readFileSync(realSourcePath, 'utf8');
        const hasDefaultExport = content.includes('export default');

        // Check for named export matching componentName
        const hasNamedExport = content.includes(`export const ${componentName}`) || content.includes(`export function ${componentName}`);

        let fileContent = ``;

        // If file uses lazy loading in App.tsx via ".then(module => ({ default: module.ShopPage }))", 
        // it implies NAMED export "ShopPage".
        // But if it was "default: module.default", it implies DEFAULT export.
        // App.tsx mostly used named exports except maybe CheckoutPage (lazy(() => import(..))).

        // To be safe: try to import as namespace if unsure? No, complex.

        if (hasDefaultExport) {
            fileContent += `import Component from '${importPath}';\n`;
        } else if (hasNamedExport) {
            fileContent += `import { ${componentName} as Component } from '${importPath}';\n`;
        } else {
            // Fallback: try named export
            fileContent += `import { ${componentName} as Component } from '${importPath}';\n`;
        }

        if (route.guard) {
            fileContent = `import { ${route.guard} } from '@/app/components/RouteGuards';\n` + fileContent;
        }

        fileContent += `\nexport default function Page() {\n`;
        if (route.guard) {
            fileContent += `  return (\n    <${route.guard}>\n      <Component />\n    </${route.guard}>\n  );\n`;
        } else {
            fileContent += `  return <Component />;\n`;
        }
        fileContent += `}\n`;

        fs.writeFileSync(path.join(routeDir, 'page.tsx'), fileContent);
        console.log(`Created ${route.path}/page.tsx`);
    } else {
        console.error(`Missing source file: ${realSourcePath}`);
    }
});
