import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../../api';
import { CalendarDays, Ban, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function MyAppointmentsPage() {
    const { t } = useTranslation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAppointments = async (pageNumber) => {
        setLoading(true);
        try {
            const { data } = await appointmentAPI.getMy(pageNumber, 10);
            setAppointments(data.content || []);
            setTotalPages(data.totalPages || 1);
            setPage(pageNumber);
        } catch {
            // toast shown by interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments(0);
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm(t('myAppointments.cancelConfirm'))) return;

        try {
            await appointmentAPI.cancel(id);
            toast.success(t('myAppointments.cancelSuccess'));
            fetchAppointments(page);
        } catch {
            // global handler
        }
    };

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

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-brand-600" />
                        {t('myAppointments.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('myAppointments.subtitle')}</p>
                </div>
                <Link to="/appointments/new" className="btn-primary">
                    {t('myAppointments.newAppointment')}
                </Link>
            </div>

            {/* ── List ── */}
            {loading && appointments.length === 0 ? (
                <div className="space-y-4">
                    <div className="skeleton h-32"></div>
                    <div className="skeleton h-32"></div>
                    <div className="skeleton h-32"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                        <CalendarDays className="w-8 h-8 text-surface-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{t('myAppointments.noAppointments')}</h3>
                    <p className="text-surface-500 mb-6">{t('myAppointments.noAppointmentsDesc')}</p>
                    <Link to="/appointments/new" className="btn-secondary">{t('myAppointments.bookNow')}</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map(app => (
                        <div key={app.id} className="card p-0 overflow-hidden flex flex-col md:flex-row border border-surface-200 dark:border-surface-800">

                            {/* Date Block (Left side on md+) */}
                            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 md:p-6 md:w-48 border-b md:border-b-0 md:border-r border-surface-200 dark:border-surface-800 flex md:flex-col items-center justify-between md:justify-center md:text-center shrink-0">
                                <div className="flex md:flex-col items-center gap-3 md:gap-1">
                                    <span className="text-4xl font-black text-surface-900 dark:text-white">
                                        {app.appointmentDate.split('-')[2]}
                                    </span>
                                    <div className="flex flex-col md:items-center">
                                        <span className="text-sm font-bold text-brand-600 uppercase">
                                            {new Date(app.appointmentDate).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
                                            {t('myAppointments.timeLabel')} {app.appointmentTime.substring(0, 5)}
                                        </span>
                                    </div>
                                </div>
                                {/* On mobile status goes here next to date */}
                                <div className="md:mt-4">
                                    {getStatusBadge(app.status)}
                                </div>
                            </div>

                            {/* Details Block */}
                            <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{app.serviceName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
                                            <span className="uppercase border px-1.5 py-0.5 rounded text-xs border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300">
                                                {app.vehiclePlate}
                                            </span>
                                            <span>•</span>
                                            <span>{app.vehicleBrand} {app.vehicleModel}</span>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <div className="text-2xl font-bold text-surface-900 dark:text-white">{app.totalPrice} ₺</div>
                                        <div className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                                            {app.deliveryMethod === 'VALET' ? t('appointment.valetDelivery') : t('appointment.selfDropDelivery')}
                                        </div>
                                    </div>
                                </div>

                                {app.adminNote && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span><strong>{t('myAppointments.adminNote')}</strong> {app.adminNote}</span>
                                    </div>
                                )}

                                {app.deliveryMethod === 'VALET' && app.pickupAddress && (
                                    <div className="mt-4 text-sm text-surface-600 dark:text-surface-400">
                                        <strong>{t('myAppointments.pickupAddress')}</strong> {app.pickupAddress.label} - {app.pickupAddress.street}, {app.pickupAddress.district}/{app.pickupAddress.city}
                                    </div>
                                )}

                                {/* Actions */}
                                {['PENDING', 'APPROVED'].includes(app.status) && (
                                    <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleCancel(app.id)}
                                            className="btn-danger bg-red-50 text-red-600 border-none hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 py-2 px-4 shadow-none"
                                        >
                                            <Ban className="w-4 h-4" /> {t('myAppointments.cancelBtn')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => fetchAppointments(page - 1)}
                                className="btn-ghost px-3 py-1"
                            >
                                {t('myAppointments.previous')}
                            </button>
                            <span className="px-4 py-1 flex items-center text-sm font-medium text-surface-500">
                                {t('myAppointments.pageOf', { current: page + 1, total: totalPages })}
                            </span>
                            <button
                                disabled={page === totalPages - 1}
                                onClick={() => fetchAppointments(page + 1)}
                                className="btn-ghost px-3 py-1"
                            >
                                {t('myAppointments.next')}
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
