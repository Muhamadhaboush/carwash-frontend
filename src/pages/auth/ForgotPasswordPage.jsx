import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import slogo from '../../assets/slogo.png';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { isDark, toggle } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setIsSent(true);
        } catch {
            // Hata olsa da "gönderildi" mesajı göster (güvenlik)
            setIsSent(true);
        } finally {
            setIsLoading(false);
        }
    };

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

                {/* Card */}
                <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-100 dark:border-surface-800 p-8">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-lg shadow-brand-500/20 overflow-hidden p-2.5 mb-4">
                            <img src={slogo} alt="NYG Auto Garage" className="max-w-full max-h-full object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                        </div>
                        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Şifremi Unuttum</h1>
                        <p className="text-sm text-surface-500 dark:text-surface-400 text-center mt-2">
                            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                        </p>
                    </div>

                    {isSent ? (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-surface-900 dark:text-white">E-posta Gönderildi!</p>
                                <p className="text-sm text-surface-500 mt-1">
                                    Eğer <span className="font-medium text-brand-600">{email}</span> adresi sistemimizde kayıtlıysa,
                                    şifre sıfırlama bağlantısı 1 dakika içinde ulaşacak.
                                </p>
                            </div>
                            <p className="text-xs text-surface-400">
                                Spam klasörünüzü kontrol etmeyi unutmayın.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label" htmlFor="forgot-email">E-posta Adresi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-surface-400" />
                                    </div>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        required
                                        className="input pl-10"
                                        placeholder="ornek@mail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="btn-primary w-full py-3 text-base shadow-lg shadow-brand-500/25"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sıfırlama Bağlantısı Gönder'}
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
