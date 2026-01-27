import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import PageTransition from "./components/ui/PageTransition";

/* ---------- CONTEXT ---------- */
import { AppProvider, useApp } from "./store/Context";
import { LanguageProvider } from "./store/LanguageContext";
import authService from "./services/authService";
import {
  NotificationProvider,
  useNotifications,
} from "./store/NotificationContext";

/* ---------- LAYOUT & UI ---------- */
import { Layout } from "./components/Layout";
import { ToastProvider, useToast } from "./components/toast";
import { ErrorBoundary } from "./components/ErrorBoundary";


/* ---------- PAGES (LAZY LOADED) ---------- */
import { HomePage } from "./pages/HomePage";
const ShopPage = lazy(() => import("./pages/ShopPage").then(module => ({ default: module.ShopPage })));
const ProductDetails = lazy(() => import("./pages/ProductDetails").then(module => ({ default: module.ProductDetails })));
const CartPage = lazy(() => import("./pages/CartPage/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage/CheckoutPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage/PaymentPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));

const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./pages/SignupPage").then(module => ({ default: module.SignupPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword").then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(module => ({ default: module.ResetPasswordPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then(module => ({ default: module.WishlistPage })));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard").then(module => ({ default: module.CustomerDashboard })));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage").then(module => ({ default: module.AboutUsPage })));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage").then(module => ({ default: module.ContactUsPage })));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage").then(module => ({ default: module.TrackOrderPage })));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage").then(module => ({ default: module.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage").then(module => ({ default: module.TermsOfServicePage })));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const AddNewAddress = lazy(() => import("./components/AddNewAddress"));
const SellOnFlipzokart = lazy(() => import("./pages/SellOnFlipzokart"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AddressBookPage = lazy(() => import("./pages/AddressBookPage"));

import { InvoicePage } from './pages/InvoicePage';
import { BannedPage } from "./pages/BannedPage";

const BannedPageWrapper = () => (
  <Suspense fallback={<CircularGlassSpinner />}>
    <BannedPage />
  </Suspense>
);

/* ---------- ADMIN (LAZY LOADED) ---------- */
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import("./pages/AdminProducts").then(module => ({ default: module.AdminProducts })));
const AdminProductEditor = lazy(() => import("./pages/AdminProducts/AdminProductEditor").then(module => ({ default: module.AdminProductEditor })));
const AdminInventory = lazy(() => import("./pages/AdminProducts/AdminInventory").then(module => ({ default: module.AdminInventory })));
const AdminOrders = lazy(() => import("./pages/AdminOrders").then(module => ({ default: module.AdminOrders })));
const AdminOrderDetails = lazy(() => import("./pages/AdminOrders/AdminOrderDetails").then(module => ({ default: module.AdminOrderDetails })));
const AdminSellers = lazy(() => import("./pages/AdminSellers").then(module => ({ default: module.AdminSellers })));
const AdminUsers = lazy(() => import("./pages/AdminUsers").then(module => ({ default: module.AdminUsers })));
const AdminMonitor = lazy(() => import("./pages/AdminMonitor").then(module => ({ default: module.AdminMonitor })));
const AdminReviews = lazy(() => import("./pages/AdminReviews").then(module => ({ default: module.AdminReviews })));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications").then(module => ({ default: module.AdminNotifications })));
const AdminSettings = lazy(() => import("./pages/AdminSettings").then(module => ({ default: module.AdminSettings })));
const AdminReports = lazy(() => import("./pages/AdminReports").then(module => ({ default: module.AdminReports })));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons").then(module => ({ default: module.AdminCoupons })));
const AdminPayments = lazy(() => import("./pages/AdminPayments").then(module => ({ default: module.AdminPayments })));
const AdminInvoices = lazy(() => import("./pages/AdminInvoices").then(module => ({ default: module.AdminInvoices })));
const AdminShipping = lazy(() => import("./pages/AdminShipping").then(module => ({ default: module.AdminShipping })));
const AdminMap = lazy(() => import("./pages/AdminMap").then(module => ({ default: module.AdminMap })));

/* ---------- SOCKET ---------- */
import { useSocket } from "./hooks/useSocket";
import CircularGlassSpinner from "./components/CircularGlassSpinner";


/* ======================================================
   ROUTE GUARDS
====================================================== */

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useApp();
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/* ======================================================
   AUTH + SOCKET WRAPPER
====================================================== */

const AuthWrapper: React.FC<{ location?: any }> = ({ location }) => {
  const { user, setUser } = useApp();
  const { addToast } = useToast();
  const { showToast } = useNotifications();

  // GLOBAL: Real-time Status Sync (5s Poll)
  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      try {
        const freshUser = await authService.getMe();
        // Check if critical status fields changed
        if (freshUser && (freshUser.status !== user.status || freshUser.suspensionEnd !== user.suspensionEnd)) {
          console.log("Status update detected:", freshUser.status);
          setUser(freshUser);
        }
      } catch (err) {
        // silent fail
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [user, setUser]);

  const liveLocation = useLocation();
  const currentLocation = location || liveLocation;

  const token = localStorage.getItem("token");
  const socket = useSocket(token);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (data: any) => {
      const isWarning = data?.type === 'warning';

      const notification = {
        _id: Date.now().toString(), // REQUIRED
        recipient: user.id,
        message: String(data?.message ?? "New notification"),
        type: String(data?.type ?? "info"),
        isRead: false,
        createdAt: new Date().toISOString(),
        status:
          data?.type === "success" ||
            data?.type === "error" ||
            data?.type === "warning"
            ? data.type
            : "info",
      };

      // Show the visual toast
      addToast(notification.status as any, notification.message);

      // Persist the notification to the bell/list ONLY if NOT a warning
      if (!isWarning) {
        showToast(notification);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, user, addToast, showToast]);

  // Strict Punishment Redirection
  const navigate = useNavigate();
  useEffect(() => {
    if (user && (user.status === 'Banned' || user.status === 'Suspended')) {
      // Allow appeal and logout, otherwise redirect
      if (location?.pathname !== '/banned' && liveLocation.pathname !== '/banned') {
        navigate('/banned');
      }
    }
  }, [user, location, liveLocation, navigate]);

  return (
    <Layout>
      <Suspense fallback={<CircularGlassSpinner />}>
        <PageTransition>
          <Routes location={currentLocation}>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/design/loading" element={<CircularGlassSpinner />} />


            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Cart / Order */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/track/:trackingId" element={<TrackOrderPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/invoice/:orderId" element={<InvoicePage />} />
            <Route path="/add-address" element={<AddNewAddress />} />
            <Route path="/banned" element={<BannedPageWrapper />} />

            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <SellOnFlipzokart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/address-book"
              element={
                <ProtectedRoute>
                  <AddressBookPage />
                </ProtectedRoute>
              }
            />
            {/* User Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-security"
              element={
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <AdminInventory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminRoute>
                  <AdminProductEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <AdminProductEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminOrderDetails />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/monitor"
              element={
                <AdminRoute>
                  <AdminMonitor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminRoute>
                  <AdminNotifications />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/sellers"
              element={
                <AdminRoute>
                  <AdminSellers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/invoices"
              element={
                <AdminRoute>
                  <AdminInvoices />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/shipping"
              element={
                <AdminRoute>
                  <AdminShipping />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/map"
              element={
                <AdminRoute>
                  <AdminMap />
                </AdminRoute>
              }
            />
          </Routes>
        </PageTransition>
      </Suspense>
    </Layout>
  );
};

/* ======================================================
   ROOT APP
====================================================== */

const App: React.FC = () => {
  return (
    <AppProvider>
      <LanguageProvider>
        <NotificationProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Router>
                <AuthWrapper />
              </Router>
            </ErrorBoundary>
          </ToastProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AppProvider>
  );
};

export default App;