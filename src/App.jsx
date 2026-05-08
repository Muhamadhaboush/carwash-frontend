import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute, PrivateRoute, AdminRoute } from './components/guards/RouteGuards';
import MaintenancePage from './pages/MaintenancePage';

// Public Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer Pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/DashboardPage';
import NewAppointmentPage from './pages/customer/NewAppointmentPage';
import MyAppointmentsPage from './pages/customer/MyAppointmentsPage';
import VehiclesPage from './pages/customer/VehiclesPage';
import AddressesPage from './pages/customer/AddressesPage';
import ProfilePage from './pages/customer/ProfilePage';
import PaymentPage from './pages/customer/PaymentPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboardPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminClosedDatesPage from './pages/admin/AdminClosedDatesPage';

function App() {
    // 🛠 BAKIM MODU: Siteyi bakıma almak isterseniz bu değeri true yapın.
    const isMaintenance = false;

    if (isMaintenance) {
        return <MaintenancePage />;
    }

    return (
        <Routes>
            {/* ── Public ── */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ── Customer ── */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <CustomerLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="appointments/new" element={<NewAppointmentPage />} />
                <Route path="appointments" element={<MyAppointmentsPage />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="payment" element={<PaymentPage />} />
            </Route>

            {/* ── Admin ── */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="closed-dates" element={<AdminClosedDatesPage />} />
            </Route>

            {/* ── 404 Fallback ── */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
