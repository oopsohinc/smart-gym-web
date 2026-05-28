import { Navigate, Outlet, Route, BrowserRouter, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import ForgotPassword from "@/pages/public/ForgotPassword";
import PackagesPublic from "@/pages/public/Packages";
import Landing from "@/pages/public/Landing";


import MemberDashboard from "@/pages/member/Dashboard";
import Profile from "@/pages/member/Profile";
import Password from "@/pages/member/Password";
import Subscription from "@/pages/member/Subscription";
import OrderCreate from "@/pages/member/Order";
import QRCheckin from "@/pages/member/QR";
import Checkins from "@/pages/member/Checkins";

import StaffCheckin from "@/pages/staff/Checkin";
import StaffOrders from "@/pages/staff/Orders";
import StaffMembers from "@/pages/staff/Members";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminPackages from "@/pages/admin/Packages";
import AdminStaff from "@/pages/admin/Staff";
import AdminOrders from "@/pages/admin/Orders";
import AdminMembers from "@/pages/admin/Members";
import AdminCheckins from "@/pages/admin/Checkins";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminRoles from "@/pages/admin/Roles";
import AdminKnowledgeBases from "@/pages/admin/KnowledgeBases";

import WorkoutPlans from "@/pages/member/WorkoutPlans";

import VnpayCreate from "@/pages/payments/VnpayCreate";
import VnpayReturn from "@/pages/payments/VnpayReturn";
import NotFound from "@/pages/not-found";
import AiAssistant from "@/components/AiAssistant";

const queryClient = new QueryClient();

function getDefaultRouteByRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "staff") return "/staff/checkin";
  return "/member/dashboard";
}

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuthContext();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
}

function HomeRoute() {
  return <Landing />;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/packages" element={<PackagesPublic />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/profile" element={<Profile />} />
        <Route path="/member/password" element={<Password />} />
        <Route path="/member/subscription" element={<Subscription />} />
        <Route path="/member/order" element={<OrderCreate />} />
        <Route path="/member/qr" element={<QRCheckin />} />
        <Route path="/member/checkins" element={<Checkins />} />
        <Route path="/member/workout-plans" element={<WorkoutPlans />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["staff", "admin"]} />}>
        <Route path="/staff/checkin" element={<StaffCheckin />} />
        <Route path="/staff/orders" element={<StaffOrders />} />
        <Route path="/staff/members" element={<StaffMembers />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/checkins" element={<AdminCheckins />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route path="/admin/knowledge-bases" element={<AdminKnowledgeBases />} />
      </Route>

      <Route path="/payments/vnpay" element={<VnpayCreate />} />
      <Route path="/payments/vnpay/result" element={<VnpayReturn />} />
      <Route path="/payments/vnpay/return" element={<VnpayReturn />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
        <AuthProvider>
          <AppRouter />
          <AiAssistant />
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
