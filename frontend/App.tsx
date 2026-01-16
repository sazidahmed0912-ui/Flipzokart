import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/Context';
import { NotificationProvider, useNotifications } from './store/NotificationContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetails } from './pages/ProductDetails';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminUsers } from './pages/AdminUsers';
import { AdminCoupons } from './pages/AdminCoupons';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import PaymentPage from './pages/PaymentPage/PaymentPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { useSocket } from './hooks/useSocket';
import ToastContainer from './components/ToastContainer'; // Import useSocket


const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useApp();
  if (!user || !isAdmin) return <Navigate to="/login" />;
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AuthWrapper: React.FC = () => {
  const { user } = useApp();
  const { addNotification } = useNotifications();
  const token = localStorage.getItem('token'); // Get token from localStorage
  const socket = useSocket(token); // Use the socket hook

  // Handle incoming notifications here if needed, or pass the socket instance down
  useEffect(() => {
    if (socket) {
      socket.on('notification', (data) => {
        console.log('Received notification:', data);
        addNotification(data); // Use addNotification from context
      });
    }
  }, [socket, addNotification]);
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />

        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        
        {/* User Protected Suite */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Advanced Admin Suite */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/coupons" element={
          <AdminRoute>
            <AdminCoupons />
          </AdminRoute>
        } />
      </Routes>
    </Layout>
  );
};

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
