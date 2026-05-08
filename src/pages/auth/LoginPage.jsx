import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Droplets, Mail, Lock, Loader2, ArrowRight, Sun, Moon, MapPin, Phone, Instagram, Languages, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../config/businessInfo';
import logo2 from '../../assets/logo2.png';
import logo_full from '../../assets/logo_full.png';
import slogo from '../../assets/slogo.png';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useAuth();
    const { isDark, toggle } = useTheme();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        setErrorMessage('');
        try {
            await login(email, password);
        } catch (error) {
            // Fallback for UI if toast is missed
            const msg = error.response?.data?.message || 'Giriş yapılamadı. E-posta veya şifrenizi kontrol edin.';
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex bg-surface-50 dark:bg-surface-950 font-sans relative">

            {/* Controls Container */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition"
                >
                    <Languages className="w-4 h-4 text-brand-600" />
                    {i18n.language.toUpperCase()}
                </button>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggle}
                    className="p-2 rounded-full bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Left Side — Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] lg:px-12 xl:px-24 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96 animate-slide-up">

                    {/* Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-lg shadow-brand-500/20 overflow-hidden p-2.5 transition-transform hover:scale-105">
                            <img 
                                src={slogo} 
                                alt="NYG Auto Garage" 
                                className="max-w-full max-h-full object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" 
                                                />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
                            {t('auth.welcome')}
                        </h2>
                        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                            {t('auth.loginSubtitle')}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label" htmlFor="email">{t('auth.email')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-surface-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="input pl-10"
                                    placeholder="ornek@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label" htmlFor="password">{t('auth.password')}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-surface-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="text-right mt-1.5">
                                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors">
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="btn-primary w-full py-3 text-base shadow-lg shadow-brand-500/25 mt-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login')}
                            {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-surface-500">
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                            {t('auth.registerNow')}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side — Image/Banner */}
            <div className="hidden lg:flex flex-1 relative bg-surface-900 items-center justify-center overflow-hidden">
                {/* Placeholder Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-surface-900 to-black"></div>

                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-12 left-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] w-full text-center px-6">
                    <div className="relative group w-full max-w-[320px] aspect-video rounded-3xl overflow-hidden mb-12 transform transition-all duration-500 hover:scale-105 hover:-translate-y-1 
                          bg-brand-950/40 backdrop-blur-xl 
                          border border-brand-500/20 
                          shadow-[0_0_50px_-10px_rgba(59,130,246,0.2)]">
                        
                        <img 
                             src={logo2} 
                            alt="NYG Auto Garage" 
                            className="relative z-20 w-full h-full object-contain p-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                            
                         />
                         <div className="absolute inset-0 z-10 bg-gradient-to-br from-brand-500/10 via-transparent to-black/40"></div>
                         
                    </div>
                    <div className="block"> 
                    <h3 className="text-4xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                        Aracınız İçin <br />
                        <span className="text-yellow-500">Premium Bakım</span>
                    </h3>

                    </div>
                    <div className="block max-w-md">
                    <p className="text-surface-200 text-lg lg:text-xl leading-relaxed">
                        Saniyeler içinde randevu oluşturun, aracınızı uzman ellere teslim edin.
                        Güvenilir, hızlı ve profesyonel hizmet için <span className="font-semibold text-white">NYG Auto Garage</span> her zaman yanınızda.
                    </p>
                    </div>
                    {/* Business Info Box */}
                    <div className="bg-surface-800/50 backdrop-blur-md rounded-2xl p-6 border border-surface-700/50 text-left">
                        <h4 className="text-lg font-bold text-white mb-4 border-b border-surface-700 pb-2">{t('contact.title')}</h4>
                        <div className="space-y-3">
                            <a 
                                href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`}
                                className="flex items-center gap-3 text-surface-300 hover:text-brand-400 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/30">
                                    <Phone className="w-4 h-4 text-brand-400" />
                                </div>
                                <span className="text-sm">{BUSINESS_INFO.phone}</span>
                            </a>
                            <a 
                                href={`mailto:${BUSINESS_INFO.email}`}
                                className="flex items-center gap-3 text-surface-300 hover:text-brand-400 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/30">
                                    <Mail className="w-4 h-4 text-brand-400" />
                                </div>
                                <span className="text-sm">{BUSINESS_INFO.email}</span>
                            </a>
                            <a 
                                href={BUSINESS_INFO.socials.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-surface-300 hover:text-brand-400 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/30">
                                    <Instagram className="w-4 h-4 text-brand-400" />
                                </div>
                                <span className="text-sm">@nyg_auto_garage</span>
                            </a>
                            <a 
                                href={`https://wa.me/90${BUSINESS_INFO.phone.replace(/\D/g, '').slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-surface-300 hover:text-green-400 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/30">
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-sm">{t('contact.whatsapp')}: {BUSINESS_INFO.phone}</span>
                            </a>
                            <a 
                                href={BUSINESS_INFO.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 text-surface-300 hover:text-brand-400 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500/30">
                                    <MapPin className="w-4 h-4 text-brand-400" />
                                </div>
                                <span className="text-sm leading-relaxed">{BUSINESS_INFO.address}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

// Temporary Car Icon for banner (since lucide is imported at top)
function Car({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    );
}
