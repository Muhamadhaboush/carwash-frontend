import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../api';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const AuthContext = createContext(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ── Uygulama ilk açıldığında: token varsa profili çek ──
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await userAPI.getMe();
                setUser(data);
            } catch {
                // Token geçersiz ise temizle
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // ── Login ──
    const login = useCallback(
        async (email, password) => {
            const { data: authData } = await authAPI.login({ email, password });

            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);

            // Profil bilgisini çek
            const { data: profile } = await userAPI.getMe();
            setUser(profile);

            localStorage.setItem('user', JSON.stringify(profile));
            toast.success(`Hoş geldiniz, ${profile.firstName}!`);

            // Role göre yönlendir
            if (profile.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }

            return profile;
        },
        [navigate]
    );

    // ── Bireysel Kayıt ──
    const registerIndividual = useCallback(
        async (payload) => {
            const { data: authData } = await authAPI.registerIndividual(payload);

            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);

            const { data: profile } = await userAPI.getMe();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));

            toast.success('Hesabınız oluşturuldu!');
            navigate('/dashboard');
            return profile;
        },
        [navigate]
    );

    // ── Kurumsal Kayıt ──
    const registerCorporate = useCallback(
        async (payload) => {
            const { data: authData } = await authAPI.registerCorporate(payload);

            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);

            const { data: profile } = await userAPI.getMe();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));

            toast.success('Kurumsal hesabınız oluşturuldu!');
            navigate('/dashboard');
            return profile;
        },
        [navigate]
    );

    // ── Logout ──
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Çıkış yapıldı.');
        navigate('/login');
    }, [navigate]);

    // ── Profil güncelle (context'i de güncelle) ──
    const refreshProfile = useCallback(async () => {
        try {
            const { data } = await userAPI.getMe();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch {
            return null;
        }
    }, []);

    // ── Helper'lar ──
    const isAdmin = user?.role === 'ADMIN';
    const isCustomer = user?.role === 'CUSTOMER';
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        registerIndividual,
        registerCorporate,
        logout,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
