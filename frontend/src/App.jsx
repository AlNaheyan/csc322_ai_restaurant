import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ChefDashboardPage from './pages/ChefDashboardPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { authService } from './services/authService';
import { setUser, logout } from './store/authSlice';
import socketService from './services/socketService';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          dispatch(setUser(userData));
          socketService.connect(token);
        } catch (err) {
          dispatch(logout());
          socketService.disconnect();
        }
      } else {
        socketService.disconnect();
      }
    };
    loadUser();
  }, [token, dispatch]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:id" element={<MenuItemDetailPage />} />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['customer', 'vip']}>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['customer', 'vip']}>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['customer', 'vip']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['customer', 'vip']}>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/chef/dashboard" element={
            <ProtectedRoute allowedRoles={['chef']}>
              <ChefDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/delivery/dashboard" element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
