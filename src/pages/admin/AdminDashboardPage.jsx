import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import {
    TrendingUp,
    Calendar,
    CheckCircle,
    Ban,
    Users,
    Wrench,
    Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getStats()
            .then(res => setStats(res.data))
            .catch()
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="skeleton h-28"></div>
                    <div className="skeleton h-28"></div>
                    <div className="skeleton h-28"></div>
                    <div className="skeleton h-28"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="skeleton h-80"></div>
                    <div className="skeleton h-80"></div>
                </div>
            </div>
        );
    }

    // Calculate trends (mocked safely if 0)
    const calculateTrendPrefix = (current, previous) => {
        if (!previous || previous === 0) return { val: '+100%', up: true };
        const diff = current - previous;
        const pct = Math.round((diff / previous) * 100);
        return { val: `${pct > 0 ? '+' : ''}${pct}%`, up: pct >= 0 };
    };

    const currentRev = stats?.monthRevenue || 0;
    const lastRev = stats?.lastMonthRevenue || 0;
    const trend = calculateTrendPrefix(currentRev, lastRev);
    const todayTotalAppointments = (stats?.pendingAppointmentsToday || 0) + 
                                  (stats?.approvedAppointmentsToday || 0) + 
                                  (stats?.completedAppointmentsToday || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-600" />
                    {t('adminDashboard.title')}
                </h2>
            </div>

            {/* ── Top Stats Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Revenue Card — Now Green/Emerald */}
                <div className="stat-card border-none bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">{t('adminDashboard.thisMonthRevenue')}</p>
                            <p className="text-3xl font-black">{currentRev.toLocaleString()} ₺</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xl font-bold">₺</span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-emerald-100 flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${trend.up ? 'text-emerald-200' : 'text-red-300 rotate-180'}`} />
                        <span>{t('adminDashboard.vsLastMonth')} {trend.val}</span>
                    </div>
                </div>

                {/* Appointments Today */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">{t('adminDashboard.appointmentsToday')}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="stat-value">{todayTotalAppointments}</p>
                                <span className="text-xs text-surface-500 font-medium">{t('adminDashboard.total')}</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-auto pt-2 text-xs flex gap-3 text-surface-500 font-medium">
                        <span className="text-amber-500">{stats?.pendingAppointmentsToday} {t('adminDashboard.pending')}</span>
                        <span className="text-emerald-500">{stats?.completedAppointmentsToday} {t('adminDashboard.completed')}</span>
                    </div>
                </div>

                {/* Total Users */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">{t('adminDashboard.totalCustomers')}</p>
                            <p className="stat-value">{stats?.totalUsers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-surface-500 mt-auto">{t('adminDashboard.allRegisteredUsers')}</p>
                </div>

                {/* Active Services */}
                <div className="stat-card">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">{t('adminDashboard.activeServices')}</p>
                            <p className="stat-value">{stats?.activeWashServices}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                            <Wrench className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-surface-500 mt-auto">{t('adminDashboard.availablePackages')}</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Top Services ── */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 border-b border-surface-200 dark:border-surface-800 pb-2">
                        {t('adminDashboard.topServices')}
                    </h3>
                    {stats?.topServices && stats.topServices.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topServices.map((srv, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm font-bold text-surface-600 dark:text-surface-400">
                                            #{idx + 1}
                                        </div>
                                        <span className="font-semibold text-surface-900 dark:text-white">{srv.serviceName}</span>
                                    </div>
                                    <span className="font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full text-sm">
                                        {srv.count} {t('adminDashboard.transactions')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-surface-500 text-center py-4">{t('adminDashboard.noData')}</p>
                    )}
                </div>

                {/* ── Vehicle Distribution ── */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 border-b border-surface-200 dark:border-surface-800 pb-2">
                        {t('adminDashboard.vehicleDistribution')}
                    </h3>
                    {stats?.vehicleTypeDistribution && Object.keys(stats.vehicleTypeDistribution).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(stats.vehicleTypeDistribution).map(([type, count]) => {
                                // Sadece görsel için max sayısı 10 sayalım veya oranlayalım (basit progress)
                                const pct = Math.min((count / (stats.totalAppointmentsThisMonth || 1)) * 100, 100);
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-surface-700 dark:text-surface-300">{type}</span>
                                            <span className="font-bold text-surface-900 dark:text-white">{count}</span>
                                        </div>
                                        <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-surface-500 text-center py-4">{t('adminDashboard.noData')}</p>
                    )}
                </div>

            </div>
        </div>
    );
}
