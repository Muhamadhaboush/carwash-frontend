import { useState, useEffect } from 'react';
import { vehicleAPI } from '../../api';
import { Car, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function VehiclesPage() {
    const { t } = useTranslation();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        plateNumber: '',
        brand: '',
        model: '',
        vehicleType: 'SEDAN'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const { data } = await vehicleAPI.getMyVehicles();
            setVehicles(data || []);
        } catch (error) {
            // Interceptor handles toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await vehicleAPI.addVehicle(formData);
            toast.success(t('vehicles.addSuccess'));
            setIsModalOpen(false);
            setFormData({ plateNumber: '', brand: '', model: '', vehicleType: 'SEDAN' });
            fetchVehicles();
        } catch (error) {
            // Interceptor handles toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('vehicles.deleteConfirm'))) return;
        try {
            await vehicleAPI.deleteVehicle(id);
            toast.success(t('vehicles.deleteSuccess'));
            setVehicles(prev => prev.filter(v => v.id !== id));
        } catch {
            // Handled globally
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await vehicleAPI.setDefault(id);
            toast.success(t('vehicles.setDefaultSuccess'));
            fetchVehicles();
        } catch {
            // Handled globally
        }
    };

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        <Car className="w-6 h-6 text-brand-600" />
                        {t('vehicles.title')}
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">{t('vehicles.subtitle')}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    {t('vehicles.addNew')}
                </button>
            </div>

            {/* ── List ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="skeleton h-32"></div>
                    <div className="skeleton h-32"></div>
                </div>
            ) : vehicles.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
                        <Car className="w-8 h-8 text-surface-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{t('vehicles.noVehicles')}</h3>
                    <p className="text-surface-500 max-w-sm mb-6">{t('vehicles.noVehiclesDesc')}</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn-secondary">
                        {t('vehicles.addFirst')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className={`card p-5 relative group overflow-hidden ${vehicle.isDefault ? 'border-brand-500 ring-1 ring-brand-500/20 shadow-brand-500/10' : ''}`}>

                            {vehicle.isDefault && (
                                <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    {t('vehicles.defaultBadge')}
                                </div>
                            )}

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md font-mono font-bold text-lg text-surface-900 dark:text-white mb-3">
                                        {vehicle.plateNumber}
                                    </div>
                                    <h4 className="font-semibold text-surface-900 dark:text-white text-lg">{vehicle.brand}</h4>
                                    <p className="text-surface-500 text-sm">{vehicle.model} • {vehicle.vehicleType}</p>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                                {!vehicle.isDefault ? (
                                    <button
                                        onClick={() => handleSetDefault(vehicle.id)}
                                        className="text-xs font-semibold text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> {t('vehicles.setDefault')}
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> {t('vehicles.defaultVehicle')}
                                    </span>
                                )}

                                <button
                                    onClick={() => handleDelete(vehicle.id)}
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
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white">{t('vehicles.modalTitle')}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">{t('vehicles.plate')}</label>
                                <input
                                    required
                                    className="input uppercase font-mono"
                                    placeholder="34 ABC 123"
                                    value={formData.plateNumber}
                                    onChange={e => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">{t('vehicles.brand')}</label>
                                    <input required className="input" placeholder="BMW" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">{t('vehicles.model')}</label>
                                    <input required className="input" placeholder="320i" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="label">{t('vehicles.vehicleType')}</label>
                                <select
                                    className="select"
                                    value={formData.vehicleType}
                                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                >
                                    <option value="SEDAN">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="HATCHBACK">Hatchback</option>
                                    <option value="PICKUP">Pickup</option>
                                    <option value="VAN">Van</option>
                                    <option value="MOTORCYCLE">{t('vehicles.motorcycle')}</option>
                                    <option value="OTHER">{t('vehicles.other')}</option>
                                </select>
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
