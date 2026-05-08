import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Wrench, Plus, Edit2, Trash2, Power, PowerOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AdminServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationMinutes: '',
        available: true,
        vehiclePrices: {}
    });

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getAllServices();
            setServices(data || []);
        } catch {
            // toast shown globally
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const openNewModal = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', durationMinutes: '', available: true, vehiclePrices: {} });
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingId(service.id);
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            durationMinutes: service.durationMinutes,
            available: service.isActive ?? service.active ?? service.available ?? true,
            vehiclePrices: service.vehiclePrices || {}
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert to proper types
        const payload = {
            ...formData,
            price: Number(formData.price),
            durationMinutes: Number(formData.durationMinutes)
        };

        try {
            if (editingId) {
                await adminAPI.updateService(editingId, payload);
                toast.success('Hizmet güncellendi');
            } else {
                await adminAPI.createService(payload);
                toast.success('Yeni hizmet eklendi');
            }
            setIsModalOpen(false);
            fetchServices();
        } catch {
            // handler
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
        try {
            await adminAPI.deleteService(id);
            toast.success('Hizmet silindi');
            fetchServices();
        } catch { }
    };

    const toggleStatus = async (id) => {
        try {
            await adminAPI.toggleServiceStatus(id);
            toast.success('Hizmet durumu güncellendi');
            fetchServices();
        } catch { }
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-rose-600" />
                        {t('services.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('services.subtitle')}</p>
                </div>
                <button onClick={openNewModal} className="btn-primary bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/20">
                    <Plus className="w-5 h-5" /> {t('services.addNew')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 w-full"></div>)
                ) : services.length === 0 ? (
                    <div className="col-span-full card p-12 text-center text-surface-500">{t('services.noServices')}</div>
                ) : (
                    services.map(srv => {
                        const isServiceActive = srv.isActive ?? srv.active;
                        return (
                        <div key={srv.id} className={`card p-5 relative border-2 transition-all ${isServiceActive
                                ? 'border-surface-200 dark:border-surface-800'
                                : 'border-dashed border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30'
                            }`}>

                            {!isServiceActive && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    {t('common.passive').toUpperCase()}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-surface-900 dark:text-white">{srv.name}</h3>
                                <span className="text-lg font-black text-rose-600 dark:text-rose-500">{srv.price} ₺</span>
                            </div>
                            <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                {srv.description}
                            </p>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100 dark:border-surface-800/50">
                                <span className="text-sm font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-lg">
                                    ⏱ {srv.durationMinutes} {t('services.duration').toLowerCase().split('(')[0].trim()}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(srv.id)}
                                        className="p-2 btn-ghost text-surface-500"
                                        title={isServiceActive ? t('services.deactivate') : t('services.activate')}
                                    >
                                        {isServiceActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                    <button onClick={() => openEditModal(srv)} className="p-2 btn-ghost text-blue-500"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(srv.id)} className="p-2 btn-ghost text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
                        <div className="p-6 border-b border-surface-100 dark:border-surface-800">
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                                {editingId ? t('services.edit') : t('services.addNew')}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">{t('services.name')}</label>
                                <input required className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="label">{t('services.description')}</label>
                                <textarea required className="input min-h-[80px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Taban {t('services.price')}</label>
                                    <input required type="number" min="0" step="0.01" className="input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">{t('services.duration')}</label>
                                    <input required type="number" min="5" step="5" className="input" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} />
                                </div>
                            </div>
                            
                            <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
                                <label className="label text-sm text-surface-500 mb-2">Araç Tipine Özel Fiyatlar (İsteğe Bağlı)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'MOTORCYCLE'].map(type => (
                                        <div key={type} className="flex items-center gap-2">
                                            <span className="text-xs font-medium w-20">{type}</span>
                                            <input 
                                                type="number" min="0" step="0.01" className="input py-1 px-2 text-sm" 
                                                placeholder="Taban Fiyat"
                                                value={formData.vehiclePrices[type] || ''} 
                                                onChange={e => setFormData({
                                                    ...formData, 
                                                    vehiclePrices: {
                                                        ...formData.vehiclePrices,
                                                        [type]: e.target.value ? Number(e.target.value) : undefined
                                                    }
                                                })} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded-xl cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                                <input
                                    type="checkbox"
                                    checked={formData.available}
                                    onChange={e => setFormData({ ...formData, available: e.target.checked })}
                                    className="w-5 h-5 accent-rose-600"
                                />
                                <span className="text-sm font-medium">{t('services.isActive')}</span>
                            </label>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary bg-rose-600 hover:bg-rose-700 flex-1">
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
