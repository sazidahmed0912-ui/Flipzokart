import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import PageTransition from "./components/ui/PageTransition";

/* ---------- CONTEXT ---------- */
import { AppProvider, useApp } from "./store/Context";
import {
  NotificationProvider,
  useNotifications,
} from "./store/NotificationContext";

/* ---------- LAYOUT & UI ---------- */
import { Layout } from "./components/Layout";
import { ToastProvider, useToast } from "./components/toast";


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
const WishlistPage = lazy(() => import("./pages/WishlistPage").then(module => ({ default: module.WishlistPage })));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard").then(module => ({ default: module.CustomerDashboard })));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage").then(module => ({ default: module.AboutUsPage })));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage").then(module => ({ default: module.ContactUsPage })));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage").then(module => ({ default: module.TrackOrderPage })));

/* ---------- ADMIN (LAZY LOADED) ---------- */
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import("./pages/AdminProducts").then(module => ({ default: module.AdminProducts })));
const AdminOrders = lazy(() => import("./pages/AdminOrders").then(module => ({ default: module.AdminOrders })));
const AdminSellers = lazy(() => import("./pages/AdminSellers").then(module => ({ default: module.AdminSellers })));
const AdminUsers = lazy(() => import("./pages/AdminUsers").then(module => ({ default: module.AdminUsers })));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons").then(module => ({ default: module.AdminCoupons })));

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
  const { user } = useApp();
  const { addToast } = useToast();
  const { showToast } = useNotifications();

  const liveLocation = useLocation();
  const currentLocation = location || liveLocation;

  const token = localStorage.getItem("token");
  const socket = useSocket(token);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (data: any) => {
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

      // Persist the notification to the bell/list
      showToast(notification);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, user, addToast, showToast]);

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
            <Route path="/track-order" element={<TrackOrderPage />} />

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
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
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
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <AuthWrapper />
          </Router>
        </ToastProvider>
        {/* <ToastContainer /> */}
      </NotificationProvider>
    </AppProvider>
  );
};

export default App;