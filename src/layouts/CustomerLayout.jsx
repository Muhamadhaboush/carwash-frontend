import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { BUSINESS_INFO } from '../config/businessInfo';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    CalendarPlus,
    CalendarDays,
    Car,
    MapPin,
    UserCircle,
    LogOut,
    Menu,
    X,
    Sun,
    Moon,
    Droplets,
} from 'lucide-react';
import logoResmi from '../assets/logo.png';
import logo_full from '../assets/logo_full.png';
import slogo from '../assets/slogo.png';
const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, exact: true },
    { to: '/appointments/new', labelKey: 'nav.newAppointment', icon: CalendarPlus, exact: true },
    { to: '/appointments', labelKey: 'nav.appointments', icon: CalendarDays, exact: true },
    { to: '/vehicles', labelKey: 'nav.vehicles', icon: Car, exact: true },
    { to: '/addresses', labelKey: 'nav.addresses', icon: MapPin, exact: true },
    { to: '/profile', labelKey: 'nav.profile', icon: UserCircle, exact: true },
];

export default function CustomerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const { t, i18n } = useTranslation();

    const toggleLang = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
        localStorage.setItem('lang', newLang);
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
        }`;

    return (
        <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
            {/* ── Sidebar Overlay (mobile) ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-72 flex flex-col
          bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200 dark:border-surface-800">
                    <div className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center shadow-2xl shadow-black/30 overflow-hidden p-1.5 transition-transform hover:scale-105">
                        
                        <img 
                         src={slogo} 
                         alt="NYG Auto Garage" 
                        className="max-w-full max-h-full object-contain" 
                    />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-surface-900 dark:text-white">CarWash</h1>
                        <p className="text-xs text-surface-400">Randevu Sistemi</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto lg:hidden btn-ghost p-1.5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, labelKey, icon: Icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={linkClasses}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {t(labelKey)}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div className="px-4 py-4 border-t border-surface-200 dark:border-surface-800 space-y-3">
                    <div className="flex items-center gap-3 px-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={toggleLang}
                                className="btn-ghost p-1.5 text-xs font-bold text-brand-600"
                                title={t('language.switch')}
                            >
                                {i18n.language === 'tr' ? 'EN' : 'TR'}
                            </button>
                            <button onClick={toggle} className="btn-ghost p-2" title="Tema değiştir">
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                    </button>
                </div>

                {/* Business Info Footer */}
                <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-[10px] text-surface-500 dark:text-surface-400 text-center border-t border-surface-200 dark:border-surface-800">
                    <p className="font-semibold text-surface-700 dark:text-surface-300 mb-1">{BUSINESS_INFO.name}</p>
                    <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} className="hover:text-brand-500 transition-colors block">{BUSINESS_INFO.phone}</a>
                    <a href={`https://wa.me/905334762899`} target="_blank" rel="noopener noreferrer" className="mt-0.5 hover:text-green-500 transition-colors block">💬 WhatsApp</a>
                    <a href={BUSINESS_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 opacity-75 hover:text-brand-500 hover:opacity-100 transition-colors block leading-tight">
                        {BUSINESS_INFO.address}
                    </a>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 min-h-screen flex flex-col">
                {/* Top bar (mobile) */}
                <header className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-brand-600" />
                            <span className="font-semibold text-surface-900 dark:text-white">CarWash</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
