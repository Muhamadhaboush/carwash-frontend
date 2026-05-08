import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { CalendarOff, Trash2, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AdminClosedDatesPage() {
    const { t } = useTranslation();
    const [closedDates, setClosedDates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dateStr, setDateStr] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchClosedDates = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getClosedDates();
            setClosedDates(data || []);
        } catch {
            // 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClosedDates();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!dateStr) return;

        setIsSubmitting(true);
        try {
            await adminAPI.addClosedDate({ closedDate: dateStr, reason });
            toast.success(t('closedDates.addSuccess'));
            setDateStr('');
            setReason('');
            fetchClosedDates();
        } catch {
            //
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (dateStr) => {
        if (!window.confirm(t('closedDates.deleteConfirm'))) return;

        try {
            await adminAPI.deleteClosedDate(dateStr);
            toast.success(t('closedDates.deleteSuccess'));
            fetchClosedDates();
        } catch {
            //
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <CalendarOff className="w-6 h-6 text-rose-600" />
                        {t('closedDates.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('closedDates.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Add Form */}
                <div className="card p-6 lg:col-span-1">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{t('closedDates.addNew')}</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="label">{t('closedDates.date')}</label>
                            <input
                                type="date"
                                required
                                className="input"
                                value={dateStr}
                                min={new Date().toISOString().split('T')[0]} // Sadece bugünden sonrasını engelleme mantığı
                                onChange={e => setDateStr(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">{t('closedDates.reason')}</label>
                            <input
                                className="input"
                                placeholder={t('closedDates.reasonPlaceholder')}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting || !dateStr} className="btn-primary bg-rose-600 hover:bg-rose-700 w-full mt-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-1" />}
                            {!isSubmitting && t('closedDates.addToList')}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card lg:col-span-2 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 font-medium border-b border-surface-200 dark:border-surface-800">
                                <tr>
                                    <th className="px-6 py-4">{t('closedDates.date')}</th>
                                    <th className="px-6 py-4">{t('closedDates.reason')}</th>
                                    <th className="px-6 py-4 text-right">{t('users.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                                {loading ? (
                                    <tr><td colSpan="3" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-500" /></td></tr>
                                ) : closedDates.length === 0 ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-surface-500">{t('closedDates.noData')}</td></tr>
                                ) : (
                                    closedDates.map(cd => (
                                        <tr key={cd.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-rose-600 dark:text-rose-500">
                                                    {new Date(cd.closedDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                                                {cd.reason || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(cd.closedDate)}
                                                    className="p-2 btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
}
