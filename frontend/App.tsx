import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* ---------- CONTEXT ---------- */
import { AppProvider, useApp } from "./store/Context";
import {
  NotificationProvider,
  useNotifications,
} from "./store/NotificationContext";

/* ---------- LAYOUT & UI ---------- */
import { Layout } from "./components/Layout";
import ToastContainer from "./components/ToastContainer";

/* ---------- PAGES ---------- */
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetails } from "./pages/ProductDetails";
import CartPage from "./pages/CartPage/CartPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { WishlistPage } from "./pages/WishlistPage";
import { CustomerDashboard } from './pages/CustomerDashboard'; // Import CustomerDashboard
import { AboutUsPage } from "./pages/AboutUsPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { TrackOrderPage } from "./pages/TrackOrderPage";

/* ---------- ADMIN ---------- */
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminProducts } from "./pages/AdminProducts";
import { AdminOrders } from "./pages/AdminOrders";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminCoupons } from "./pages/AdminCoupons";

/* ---------- SOCKET ---------- */
import { useSocket } from "./hooks/useSocket";

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

const AuthWrapper: React.FC = () => {
  const { user } = useApp();
  const { showToast } = useNotifications();

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

      showToast(notification);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, user, showToast]);

  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />

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
          path="/admin/coupons"
          element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          }
        />
      </Routes>
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
        <Router>
          <AuthWrapper />
        </Router>
        <ToastContainer />
      </NotificationProvider>
    </AppProvider>
  );
};

export default App;