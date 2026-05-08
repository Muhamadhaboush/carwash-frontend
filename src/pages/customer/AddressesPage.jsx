import { useState, useEffect } from 'react';
import { addressAPI } from '../../api';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, Map, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AddressesPage() {
    const { t } = useTranslation();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        label: '',
        street: '',
        district: '',
        city: '',
        postalCode: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const { data } = await addressAPI.getMyAddresses();
            setAddresses(data || []);
        } catch (error) {
            // Interceptor handles toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addressAPI.addAddress(formData);
            toast.success(t('addresses.addSuccess'));
            setIsModalOpen(false);
            setFormData({ label: '', street: '', district: '', city: '', postalCode: '' });
            fetchAddresses();
        } catch (error) {
            // Interceptor handles toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('addresses.deleteConfirm'))) return;
        try {
            await addressAPI.deleteAddress(id);
            toast.success(t('addresses.deleteSuccess'));
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch {
            // Handled globally
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressAPI.setDefault(id);
            toast.success(t('addresses.setDefaultSuccess'));
            fetchAddresses();
        } catch {
            // Handled globally
        }
    };

    const getIcon = (label) => {
        const l = label.toLowerCase();
        if (l.includes('iş') || l.includes('ofis') || l.includes('work') || l.includes('office')) return <Building2 className="w-5 h-5" />;
        if (l.includes('ev') || l.includes('home')) return <Home className="w-5 h-5" />;
        return <Map className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-brand-600" />
                        {t('addresses.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('addresses.subtitle')}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    {t('addresses.addNew')}
                </button>
            </div>

            {/* ── List ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="skeleton h-32"></div>
                    <div className="skeleton h-32"></div>
                </div>
            ) : addresses.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-surface-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{t('addresses.noAddresses')}</h3>
                    <p className="text-surface-500 max-w-sm mb-6">{t('addresses.noAddressesDesc')}</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn-secondary">
                        {t('addresses.addFirst')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {addresses.map(address => (
                        <div key={address.id} className={`card p-5 relative group overflow-hidden ${address.isDefault ? 'border-brand-500 ring-1 ring-brand-500/20 shadow-brand-500/10' : ''}`}>

                            {address.isDefault && (
                                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    {t('addresses.defaultBadge')}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    {getIcon(address.label)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-surface-900 dark:text-white text-lg">{address.label}</h4>
                                    <p className="text-surface-600 dark:text-surface-400 text-sm mt-1 leading-relaxed">
                                        {address.street}
                                        <br />
                                        {address.district && `${address.district}, `}{address.city} {address.postalCode}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                                {!address.isDefault ? (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-xs font-semibold text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> {t('addresses.setDefault')}
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> {t('addresses.defaultAddress')}
                                    </span>
                                )}

                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition"
                                    title={t('common.delete')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
                        <div className="p-6 border-b border-surface-100 dark:border-surface-800">
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white">{t('addresses.modalTitle')}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">{t('addresses.addressLabel')}</label>
                                <input required className="input" placeholder={t('addresses.addressLabelPlaceholder')} value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} />
                            </div>

                            <div>
                                <label className="label">{t('addresses.street')}</label>
                                <textarea
                                    required
                                    className="input min-h-[80px] resize-none"
                                    placeholder={t('addresses.streetPlaceholder')}
                                    value={formData.street}
                                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">{t('addresses.district')}</label>
                                    <input required className="input" placeholder="Kadıköy" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">{t('addresses.city')}</label>
                                    <input required className="input" placeholder="İstanbul" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
