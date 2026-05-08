import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import { CalendarCheck, Filter, Check, X, Loader2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AdminAppointmentsPage() {
    const { t } = useTranslation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [monthFilter, setMonthFilter] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [actionType, setActionType] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAppointments = useCallback(async (pageNumber, status = statusFilter, month = monthFilter, search = searchQuery) => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getAllAppointments(status, pageNumber, 20, month, search);
            setAppointments(data.content || []);
            setTotalPages(data.totalPages || 1);
            setPage(pageNumber);
        } catch {
            // toast shown by interceptor
        } finally {
            setLoading(false);
        }
    }, [statusFilter, monthFilter, searchQuery]);

    useEffect(() => {
        setPage(0);
        fetchAppointments(0, statusFilter, monthFilter, searchQuery);
    }, [statusFilter, monthFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            fetchAppointments(0, statusFilter, monthFilter, searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleStatusUpdate = async () => {
        setIsSubmitting(true);
        let newStatus = '';
        if (actionType === 'APPROVE') newStatus = 'APPROVED';
        if (actionType === 'REJECT') newStatus = 'REJECTED';
        if (actionType === 'COMPLETE') newStatus = 'COMPLETED';

        try {
            await adminAPI.updateAppointmentStatus(selectedApp.id, {
                status: newStatus,
                adminNote: adminNote || null
            });
            toast.success(`Randevu durumu güncellendi: ${newStatus}`);
            setIsModalOpen(false);
            setAdminNote('');
            fetchAppointments(page);
        } catch {
            // handler
        } finally {
            setIsSubmitting(false);
        }
    };

    const openModal = (app, action) => {
        setSelectedApp(app);
        setActionType(action);
        setAdminNote('');
        setIsModalOpen(true);
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

    // Month navigation
    const changeMonth = (dir) => {
        const [year, month] = monthFilter.split('-').map(Number);
        const d = new Date(year, month - 1 + dir, 1);
        setMonthFilter(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const monthLabel = () => {
        const [year, month] = monthFilter.split('-').map(Number);
        return new Date(year, month - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6">

            {/* ── Header & Filters ── */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                            <CalendarCheck className="w-6 h-6 text-rose-600" />
                            {t('adminAppointments.title')}
                        </h2>
                        <p className="text-sm text-surface-500 mt-1">{t('adminAppointments.subtitle')}</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="card p-4 flex flex-wrap items-center gap-3">
                    {/* Month Navigator */}
                    <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-xl px-3 py-2">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:text-rose-600 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white w-36 text-center capitalize">
                            {monthLabel()}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:text-rose-600 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-3 text-surface-400" />
                        <select
                            className="select pl-9 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">{t('adminAppointments.allStatus')}</option>
                            <option value="PENDING">{t('adminAppointments.pendingOnly')}</option>
                            <option value="APPROVED">{t('adminAppointments.approvedOnly')}</option>
                            <option value="COMPLETED">{t('adminAppointments.completedOnly')}</option>
                            <option value="CANCELLED">{t('adminAppointments.cancelledOnly')}</option>
                            <option value="REJECTED">Reddedildi</option>
                        </select>
                    </div>

                    {/* Customer Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <User className="w-4 h-4 absolute left-3 top-3 text-surface-400" />
                        <input
                            type="text"
                            className="input pl-9 text-sm py-2"
                            placeholder="Müşteri adı / şirket ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {(statusFilter || searchQuery) && (
                        <button
                            onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
                            className="text-xs text-rose-600 font-medium hover:underline"
                        >
                            Filtreleri Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* ── Desktop Table ── */}
            <div className="card overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 font-medium border-b border-surface-200 dark:border-surface-800">
                            <tr>
                                <th className="px-6 py-4">{t('adminAppointments.dateTime')}</th>
                                <th className="px-6 py-4">{t('adminAppointments.customer')}</th>
                                <th className="px-6 py-4">{t('adminAppointments.serviceVehicle')}</th>
                                <th className="px-6 py-4">{t('adminAppointments.priceDelivery')}</th>
                                <th className="px-6 py-4">{t('adminAppointments.status')}</th>
                                <th className="px-6 py-4 text-right">{t('users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" /></td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-surface-500">{t('common.noData')}</td></tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-surface-900 dark:text-white">
                                                {new Date(app.appointmentDate).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div className="text-surface-500">{app.appointmentTime.substring(0, 5)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-surface-900 dark:text-white flex items-center gap-1.5"><User className="w-4 h-4 text-surface-400" /> {app.userFullName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-surface-900 dark:text-white">{app.serviceName}</div>
                                            <div className="text-surface-500 font-mono text-xs">{app.vehiclePlate} ({app.vehicleBrand})</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-surface-900 dark:text-white">{app.totalPrice} ₺</div>
                                            <div className="text-xs text-surface-500">{app.deliveryMethod === 'VALET' ? t('adminAppointments.valet') : t('adminAppointments.selfDrop')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => openModal(app, 'APPROVE')} className="btn-ghost p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20" title={t('adminAppointments.approve')}><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => openModal(app, 'REJECT')} className="btn-ghost p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20" title={t('adminAppointments.reject')}><X className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            {app.status === 'APPROVED' && (
                                                <button onClick={() => openModal(app, 'COMPLETE')} className="btn-secondary py-1.5 px-3 text-xs" title={t('adminAppointments.complete')}>{t('adminAppointments.markCompleted')}</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Mobile List (Hidden on md+) ── */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" /></div>
                ) : appointments.length === 0 ? (
                    <div className="card p-8 text-center text-surface-500">{t('common.noData')}</div>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="card p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold">{app.serviceName}</div>
                                    <div className="text-sm font-semibold">{new Date(app.appointmentDate).toLocaleDateString('tr-TR')} {app.appointmentTime.substring(0, 5)}</div>
                                </div>
                                {getStatusBadge(app.status)}
                            </div>
                            <div className="text-sm border-y border-surface-100 dark:border-surface-800 py-2 my-2 space-y-1">
                                <p>👤 {app.userFullName}</p>
                                <p>🚗 {app.vehiclePlate}</p>
                                <p>💰 {app.totalPrice} ₺ ({app.deliveryMethod})</p>
                            </div>
                            <div className="flex gap-2">
                                {app.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => openModal(app, 'APPROVE')} className="btn-primary flex-1 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700">{t('adminAppointments.approve')}</button>
                                        <button onClick={() => openModal(app, 'REJECT')} className="btn-danger flex-1 py-1.5 text-xs">{t('adminAppointments.reject')}</button>
                                    </>
                                )}
                                {app.status === 'APPROVED' && (
                                    <button onClick={() => openModal(app, 'COMPLETE')} className="btn-primary w-full py-1.5 text-xs">{t('adminAppointments.complete')}</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button disabled={page === 0} onClick={() => fetchAppointments(page - 1)} className="btn-ghost px-3 py-1">{t('common.previous')}</button>
                    <span className="px-4 py-1 text-sm font-medium">{t('common.page')} {page + 1} / {totalPages}</span>
                    <button disabled={page === totalPages - 1} onClick={() => fetchAppointments(page + 1)} className="btn-ghost px-3 py-1">{t('common.next')}</button>
                </div>
            )}

            {/* ── Status Update Modal ── */}
            {isModalOpen && selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
                        <div className="p-6 border-b border-surface-100 dark:border-surface-800">
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                                {actionType === 'APPROVE' && t('adminAppointments.modalApproveTitle')}
                                {actionType === 'REJECT' && t('adminAppointments.modalRejectTitle')}
                                {actionType === 'COMPLETE' && t('adminAppointments.modalCompleteTitle')}
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded-lg text-sm border border-surface-200 dark:border-surface-700">
                                <p><strong>{t('adminAppointments.customer')}:</strong> {selectedApp.userFullName}</p>
                                <p><strong>{t('closedDates.date')}:</strong> {selectedApp.appointmentDate} - {selectedApp.appointmentTime.substring(0, 5)}</p>
                                <p><strong>{t('services.name')}:</strong> {selectedApp.serviceName} ({selectedApp.vehiclePlate})</p>
                                {selectedApp.deliveryMethod === 'VALET' && selectedApp.pickupAddress && (
                                    <p className="border-t border-surface-200 dark:border-surface-700 mt-2 pt-2 text-rose-600 dark:text-rose-400">
                                        <strong>{t('adminAppointments.valetAddress')}:</strong> {selectedApp.pickupAddress.street}, {selectedApp.pickupAddress.district}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="label">{t('adminAppointments.adminNote')}</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    placeholder={actionType === 'REJECT' ? t('adminAppointments.rejectNotePlaceholder') : t('adminAppointments.completeNotePlaceholder')}
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={isSubmitting}
                                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-white transition
                    ${actionType === 'APPROVE' || actionType === 'COMPLETE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`
                                    }
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('adminAppointments.approve')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
