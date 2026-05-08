import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ──────────────────────────────────────────────
// Loading Spinner
// ──────────────────────────────────────────────
function FullScreenLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
            <div className="flex flex-col items-center gap-3 animate-fade-in">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                <p className="text-sm text-surface-500">Yükleniyor...</p>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// PrivateRoute — giriş yapmış kullanıcılar için
// ──────────────────────────────────────────────
export function PrivateRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return <FullScreenLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

// ──────────────────────────────────────────────
// AdminRoute — sadece ADMIN rolü için
// ──────────────────────────────────────────────
export function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return <FullScreenLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// ──────────────────────────────────────────────
// PublicRoute — zaten giriş yapmışsa yönlendir
// ──────────────────────────────────────────────
export function PublicRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return <FullScreenLoader />;

    if (isAuthenticated) {
        return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
    }

    return children;
}
