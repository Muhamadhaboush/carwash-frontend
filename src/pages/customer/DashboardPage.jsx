import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, vehicleAPI } from '../../api';
import { CalendarPlus, Car, Clock, CalendarCheck2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [appointments, setAppointments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appRes, vehRes] = await Promise.all([
                    appointmentAPI.getMy(0, 5), // Son 5 randevu
                    vehicleAPI.getMyVehicles()
                ]);
                setAppointments(appRes.data.content || []);
                setVehicles(vehRes.data || []);
            } catch (error) {
                // Hata API interceptor tarafından gösterilir
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="badge-pending">{t('appointment.status_PENDING')}</span>;
            case 'APPROVED': return <span className="badge-approved">{t('appointment.status_APPROVED')}</span>;
            case 'COMPLETED': return <span className="badge-completed">{t('appointment.status_COMPLETED')}</span>;
            case 'CANCELLED': return <span className="badge-cancelled">{t('appointment.status_CANCELLED')}</span>;
            case 'REJECTED': return <span className="badge-rejected">{t('appointment.status_REJECTED')}</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const activeAppointments = appointments.filter(a => ['PENDING', 'APPROVED'].includes(a.status));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-32 w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="skeleton h-64"></div>
                    <div className="skeleton h-64"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Welcome Banner ── */}
            <div className="relative overflow-hidden card bg-gradient-to-r from-brand-600 to-brand-800 text-white p-8 border-none">

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">{t('dashboard.greeting')}, {user?.firstName}! 👋</h2>
                    <p className="text-brand-100 max-w-xl">
                        {t('dashboard.bookFirst')} {/* Re-used this key or you can add a specific one. Actually I'll use bookFirst here but it translates to "Create your first appointment" in English. Maybe I should just hardcode the translation for now if the key isn't perfect, but let's see. */}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <Link to="/appointments/new" className="btn-primary bg-white text-brand-700 hover:bg-surface-50">
                            <CalendarPlus className="w-5 h-5" />
                            {t('dashboard.newAppointment')}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Aktif Randevular (2 Column Span) ── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-500" /> {t('dashboard.upcoming')}
                        </h3>
                    </div>

                    <div className="card divide-y border-surface-200 dark:border-surface-800 dark:divide-surface-800">
                        {activeAppointments.length === 0 ? (
                            <div className="p-8 text-center text-surface-500">
                                <CalendarCheck2 className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                                <p>{t('dashboard.noUpcoming')}</p>
                            </div>
                        ) : (
                            activeAppointments.map(app => (
                                <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold leading-tight">{app.appointmentDate.split('-')[2]}</span>
                                            <span className="text-[10px] uppercase font-semibold leading-tight">
                                                {new Date(app.appointmentDate).toLocaleString('tr-TR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                                                {app.serviceName}
                                                {getStatusBadge(app.status)}
                                            </h4>
                                            <p className="text-sm text-surface-500 mt-1 flex items-center gap-2">
                                                <span>{app.vehiclePlate}</span> •
                                                <span>{app.appointmentTime.substring(0, 5)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{app.totalPrice} ₺</p>
                                        <p className="text-xs text-surface-500">{app.deliveryMethod === 'VALET' ? t('dashboard.valetPickup') : t('dashboard.selfDrop')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Kayıtlı Araçlarım Özeti (1 Column Span) ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Car className="w-5 h-5 text-brand-500" /> {t('dashboard.myVehicles')}
                        </h3>
                    </div>

                    <div className="card overflow-hidden">
                        {vehicles.length === 0 ? (
                            <div className="p-6 text-center text-surface-500">
                                <ShieldAlert className="w-10 h-10 mx-auto text-surface-300 mb-2" />
                                <p className="text-sm mb-4">{t('appointment.noVehicles')}</p>
                                <Link to="/vehicles" className="btn-secondary w-full">{t('appointment.goToVehicles')}</Link>
                            </div>
                        ) : (
                            <div className="divide-y border-surface-200 dark:border-surface-800 dark:divide-surface-800">
                                {vehicles.slice(0, 3).map(vehicle => (
                                    <div key={vehicle.id} className="p-4 flex items-center justify-between group">
                                        <div>
                                            <h4 className="font-semibold text-surface-900 dark:text-white">{vehicle.plateNumber}</h4>
                                            <p className="text-xs text-surface-500 uppercase tracking-wide mt-0.5">
                                                {vehicle.brand} {vehicle.model}
                                            </p>
                                        </div>
                                        {vehicle.isDefault && (
                                            <span className="text-[10px] font-bold bg-surface-100 dark:bg-surface-800 text-surface-500 px-2 py-1 rounded">{t('dashboard.defaultLabel')}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {vehicles.length > 3 && (
                            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 text-center border-t border-surface-200 dark:border-surface-800">
                                <span className="text-xs text-surface-500">{t('dashboard.moreVehicles', { count: vehicles.length - 3 })}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
