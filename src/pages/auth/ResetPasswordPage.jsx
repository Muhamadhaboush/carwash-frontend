import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api';
import { Lock, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import slogo from '../../assets/slogo.png';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { isDark, toggle } = useTheme();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (!token) {
            toast.error('Geçersiz sıfırlama bağlantısı.');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.resetPassword(token, newPassword);
            setIsDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch {
            // Hata interceptor'dan yakalanır
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-surface-50 dark:bg-surface-950 font-sans px-4">
                <div className="text-center">
                    <p className="text-red-500 font-semibold mb-4">Geçersiz veya eksik sıfırlama bağlantısı.</p>
                    <Link to="/forgot-password" className="btn-primary">Yeni bağlantı iste</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-surface-50 dark:bg-surface-950 font-sans relative px-4">

            {/* Theme Toggle */}
            <button
                onClick={toggle}
                className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-100 dark:border-surface-800 p-8">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-lg shadow-brand-500/20 overflow-hidden p-2.5 mb-4">
                            <img src={slogo} alt="NYG Auto Garage" className="max-w-full max-h-full object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                        </div>
                        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Yeni Şifre Belirle</h1>
                        <p className="text-sm text-surface-500 dark:text-surface-400 text-center mt-2">
                            Güvenli ve hatırlanması kolay bir şifre seçin.
                        </p>
                    </div>

                    {isDone ? (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-surface-900 dark:text-white">Şifreniz Güncellendi!</p>
                                <p className="text-sm text-surface-500 mt-1">
                                    3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label" htmlFor="new-password">Yeni Şifre</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-surface-400" />
                                    </div>
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        className="input pl-10 pr-10"
                                        placeholder="En az 6 karakter"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-400 hover:text-surface-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="confirm-password">Şifre Tekrar</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-surface-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="input pl-10"
                                        placeholder="Şifreyi tekrar girin"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !newPassword || !confirmPassword}
                                className="btn-primary w-full py-3 text-base shadow-lg shadow-brand-500/25"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Şifremi Güncelle'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors font-medium">
                            <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
