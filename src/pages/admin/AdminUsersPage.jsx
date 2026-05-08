import { useState, useEffect } from 'react';
import { adminAPI, companyPriceAPI, serviceAPI } from '../../api';
import { Users, Building2, User as UserIcon, Loader2, Tag, X, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Fiyat Modal
    const [priceModal, setPriceModal] = useState(null); // { user }
    const [allServices, setAllServices] = useState([]);
    const [companyPrices, setCompanyPrices] = useState([]);
    const [priceInputs, setPriceInputs] = useState({}); // { serviceId: value }
    const [savingId, setSavingId] = useState(null);

    const fetchUsers = async (pageNumber) => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getAllUsers(pageNumber, 15);
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 1);
            setPage(pageNumber);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(0);
    }, []);

    const openPriceModal = async (user) => {
        setPriceModal({ user });
        try {
            const [srvRes, priceRes] = await Promise.all([
                serviceAPI.getActive(),
                companyPriceAPI.getForUser(user.id)
            ]);
            const services = srvRes.data || [];
            const prices = priceRes.data || [];
            setAllServices(services);
            setCompanyPrices(prices);

            // Mevcut fiyatları input'lara yükle
            const inputs = {};
            prices.forEach(p => {
                inputs[p.serviceId] = p.customPrice;
            });
            setPriceInputs(inputs);
        } catch {
            toast.error('Fiyatlar yüklenemedi.');
        }
    };

    const handleSavePrice = async (serviceId) => {
        const value = priceInputs[serviceId];
        if (!value || isNaN(value) || Number(value) < 0) {
            toast.error('Geçerli bir fiyat girin.');
            return;
        }
        setSavingId(serviceId);
        try {
            await companyPriceAPI.setPrice(priceModal.user.id, serviceId, Number(value));
            toast.success('Fiyat kaydedildi.');
            // Mevcut fiyatları yenile
            const priceRes = await companyPriceAPI.getForUser(priceModal.user.id);
            setCompanyPrices(priceRes.data || []);
        } catch {
            //
        } finally {
            setSavingId(null);
        }
    };

    const handleRemovePrice = async (serviceId) => {
        setSavingId(serviceId);
        try {
            await companyPriceAPI.removePrice(priceModal.user.id, serviceId);
            toast.success('Özel fiyat kaldırıldı, global fiyat geçerli.');
            setPriceInputs(p => { const n = { ...p }; delete n[serviceId]; return n; });
            const priceRes = await companyPriceAPI.getForUser(priceModal.user.id);
            setCompanyPrices(priceRes.data || []);
        } catch {
            //
        } finally {
            setSavingId(null);
        }
    };

    const getCustomPrice = (serviceId) => companyPrices.find(p => p.serviceId === serviceId);

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-rose-600" />
                        {t('users.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('users.subtitle')}</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 font-medium border-b border-surface-200 dark:border-surface-800">
                            <tr>
                                <th className="px-6 py-4">{t('users.type')}</th>
                                <th className="px-6 py-4">{t('users.name')}</th>
                                <th className="px-6 py-4">{t('users.contact')}</th>
                                <th className="px-6 py-4">{t('users.registerDate')}</th>
                                <th className="px-6 py-4">{t('users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-500" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-surface-500">{t('users.noUsers')}</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition">
                                        <td className="px-6 py-4">
                                            {u.userType === 'CORPORATE' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Building2 className="w-3.5 h-3.5" /> {t('users.corporate')}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <UserIcon className="w-3.5 h-3.5" /> {t('users.individual')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                                                {u.firstName} {u.lastName}
                                                {u.role === 'ADMIN' && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">ADMIN</span>}
                                            </div>
                                            {u.userType === 'CORPORATE' && (
                                                <div className="text-xs text-surface-500 mt-0.5">{u.companyName} ({u.taxNumber})</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-surface-900 dark:text-white">{u.email}</div>
                                            <div className="text-surface-500 text-xs mt-0.5">{u.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.userType === 'CORPORATE' && u.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => openPriceModal(u)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 transition"
                                                >
                                                    <Tag className="w-3.5 h-3.5" /> {t('users.setPrices')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button disabled={page === 0} onClick={() => fetchUsers(page - 1)} className="btn-ghost px-3 py-1">{t('common.previous')}</button>
                    <span className="px-4 py-1 text-sm font-medium border rounded-lg bg-white dark:bg-surface-800">{t('common.page')} {page + 1} / {totalPages}</span>
                    <button disabled={page === totalPages - 1} onClick={() => fetchUsers(page + 1)} className="btn-ghost px-3 py-1">{t('common.next')}</button>
                </div>
            )}

            {/* ── Fiyat Modal ── */}
            {priceModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPriceModal(null)} />
                    <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-lg animate-scale-in max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-amber-500" />
                                    {t('users.priceModal')}
                                </h3>
                                <p className="text-sm text-surface-500 mt-0.5">
                                    {priceModal.user.companyName || `${priceModal.user.firstName} ${priceModal.user.lastName}`}
                                </p>
                            </div>
                            <button onClick={() => setPriceModal(null)} className="p-2 btn-ghost text-surface-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            <p className="text-xs text-surface-500 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                                {t('users.priceNote')}
                            </p>

                            {allServices.length === 0 ? (
                                <p className="text-surface-500 text-sm text-center py-4">Aktif hizmet bulunamadı.</p>
                            ) : (
                                allServices.map(srv => {
                                    const customEntry = getCustomPrice(srv.id);
                                    const isSaving = savingId === srv.id;
                                    return (
                                        <div key={srv.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <span className="font-semibold text-surface-900 dark:text-white text-sm">{srv.name}</span>
                                                    <span className="ml-2 text-xs text-surface-400">({t('users.globalPrice')}: {srv.price} ₺)</span>
                                                </div>
                                                {customEntry && (
                                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                                        {t('users.customPrice')}: {customEntry.customPrice} ₺
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder={`Global: ${srv.price} ₺`}
                                                    className="input flex-1 text-sm py-1.5"
                                                    value={priceInputs[srv.id] ?? ''}
                                                    onChange={e => setPriceInputs(p => ({ ...p, [srv.id]: e.target.value }))}
                                                />
                                                <button
                                                    onClick={() => handleSavePrice(srv.id)}
                                                    disabled={isSaving || !priceInputs[srv.id]}
                                                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                                                    title="Kaydet"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                </button>
                                                {customEntry && (
                                                    <button
                                                        onClick={() => handleRemovePrice(srv.id)}
                                                        disabled={isSaving}
                                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 disabled:opacity-50 transition"
                                                        title={t('users.removePrice')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t border-surface-100 dark:border-surface-800 shrink-0">
                            <button onClick={() => setPriceModal(null)} className="btn-secondary w-full">{t('common.close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
