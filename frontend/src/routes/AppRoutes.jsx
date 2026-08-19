import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import AppLoadingScreen from "@/components/common/AppLoadingScreen";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import ProductsPage from "@/pages/admin/ProductsPage";
import WorkersPage from "@/pages/admin/WorkersPage";
import ShopsPage from "@/pages/admin/ShopsPage";
import ShopProfilePage from "@/pages/admin/ShopProfilePage";
import OrdersPage from "@/pages/admin/OrdersPage";
import OrderDetailPage from "@/pages/admin/OrderDetailPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import SettingsPage from "@/pages/admin/SettingsPage";

import WorkerLayout from "@/components/layout/WorkerLayout";
import WorkerCatalogPage from "@/pages/worker/WorkerCatalogPage";
import WorkerCartPage from "@/pages/worker/WorkerCartPage";
import WorkerOrdersPage from "@/pages/worker/WorkerOrdersPage";
import WorkerOrderDetailPage from "@/pages/worker/WorkerOrderDetailPage";
import WorkerProfilePage from "@/pages/worker/WorkerProfilePage";

import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

/**
 * "/" isn't a real page — it just routes an already-logged-in user straight
 * to their role's home screen, or an anonymous visitor to /login, so nobody
 * ever sees a blank landing page.
 */
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <AppLoadingScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Navigate to={role === "admin" ? "/admin/dashboard" : "/worker/products"} replace />;
};

/**
 * Also guards /login itself: an already-authenticated user shouldn't see
 * the login form again if they hit the URL directly.
 */
const LoginRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <AppLoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/worker/products"} replace />;
  }

  return <LoginPage />;
};

/**
 * Top-level route map. Both Admin and Worker sections are nested trees under
 * their own layout shell (AdminLayout: sidebar/topbar; WorkerLayout: mobile
 * top header + bottom tabs), so neither shell remounts while navigating
 * within its section. The worker's "home" is the product catalog, not a
 * dashboard — matching the required workflow (Login → View products first).
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:id" element={<ShopProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<WorkerCatalogPage />} />
          <Route path="cart" element={<WorkerCartPage />} />
          <Route path="orders" element={<WorkerOrdersPage />} />
          <Route path="orders/:id" element={<WorkerOrderDetailPage />} />
          <Route path="profile" element={<WorkerProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
