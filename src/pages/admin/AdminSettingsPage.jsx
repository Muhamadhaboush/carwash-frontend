import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Settings, Clock, Loader2, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Backend'den gelen [{settingKey, settingValue}] array'ini objeye çevir
function parseSettings(arr) {
    const obj = {
        businessOpenTime: '09:00:00',
        businessCloseTime: '18:00:00',
        concurrentSlots: 2,
    };
    if (!arr || !Array.isArray(arr)) return obj;
    arr.forEach(({ settingKey, settingValue }) => {
        if (settingKey === 'businessOpenTime') obj.businessOpenTime = settingValue;
        if (settingKey === 'businessCloseTime') obj.businessCloseTime = settingValue;
        if (settingKey === 'concurrentSlots') obj.concurrentSlots = Number(settingValue);
    });
    return obj;
}

export default function AdminSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAdmin, setIsSavingAdmin] = useState(false);
    const [error, setError] = useState(null);

    // Admin Profil Ayarları
    const [adminProfile, setAdminProfile] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        adminAPI.getSettings()
            .then(res => setSettings(parseSettings(res.data)))
            .catch(err => {
                console.error('Ayarlar yüklenemedi:', err);
                setError('Ayarlar yüklenirken bir hata oluştu.');
                setSettings(parseSettings([]));
            });

        // Mevcut admin bilgilerini getir
        adminAPI.getMe()
            .then(res => setAdminProfile({ email: res.data.email, password: '' }))
            .catch(err => console.error('Admin bilgileri alınamadı:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await adminAPI.updateSettings(settings);
            toast.success(t('settings.saved'));
        } catch (err) {
            console.error('Ayarlar kaydedilemedi:', err);
            toast.error('Ayarlar kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        if (!adminProfile.email) return toast.error('E-posta alanı boş bırakılamaz.');
        
        setIsSavingAdmin(true);
        try {
            await adminAPI.updateAdminProfile(adminProfile);
            toast.success(t('settings.adminUpdateSuccess'));
        } catch (err) {
            console.error('Admin güncellenemedi:', err);
            const msg = err.response?.data?.message || 'Admin bilgileri güncellenirken bir hata oluştu.';
            toast.error(msg);
        } finally {
            setIsSavingAdmin(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl space-y-4">
                <div className="skeleton h-10 w-64" />
                <div className="skeleton h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-rose-600" />
                    {t('settings.title')}
                </h2>
                <p className="text-sm text-surface-500 mt-1">{t('settings.subtitle')}</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="card p-6 border-t-4 border-t-rose-500">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Çalışma Saatleri */}
                    <div>
                        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-surface-400" /> {t('settings.workingHours')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                            <div>
                                <label className="label">{t('settings.openTime')}</label>
                                <input
                                    type="time"
                                    required
                                    className="input font-mono text-lg"
                                    value={settings?.businessOpenTime?.substring(0, 5) || '09:00'}
                                    onChange={e => setSettings(s => ({ ...s, businessOpenTime: e.target.value + ':00' }))}
                                />
                            </div>
                            <div>
                                <label className="label">{t('settings.closeTime')}</label>
                                <input
                                    type="time"
                                    required
                                    className="input font-mono text-lg"
                                    value={settings?.businessCloseTime?.substring(0, 5) || '18:00'}
                                    onChange={e => setSettings(s => ({ ...s, businessCloseTime: e.target.value + ':00' }))}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-surface-500 mt-2 ml-1">Müşteriler randevu alırken, seçilen hizmetin süresi kapanış saatini aşmayacak şekilde slotlar hesaplanır.</p>
                    </div>

                    {/* Eşzamanlı İstasyon Sayısı */}
                    <div>
                        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{t('settings.capacity')}</h3>
                        <div className="w-full sm:w-1/2">
                            <label className="label">{t('settings.capacityLabel')}</label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="input"
                                value={settings?.concurrentSlots || 2}
                                onChange={e => setSettings(s => ({ ...s, concurrentSlots: Number(e.target.value) }))}
                            />
                            <p className="text-xs text-surface-500 mt-2">{t('settings.capacityDesc')}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
                        <button type="submit" disabled={isSaving} className="btn-primary bg-rose-600 hover:bg-rose-700 w-full sm:w-auto px-8">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isSaving ? t('common.saving') : t('settings.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Admin Profile Settings */}
            <div className="card p-6 border-t-4 border-t-blue-500">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" /> {t('settings.adminProfileTitle')}
                </h3>
                <p className="text-sm text-surface-500 mb-6">
                    {t('settings.adminProfileSubtitle')}
                    <span className="text-amber-600 block mt-1 font-medium">{t('settings.adminProfileWarning')}</span>
                </p>
                
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">{t('settings.adminEmailLabel')}</label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={adminProfile.email}
                                onChange={e => setAdminProfile(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">{t('settings.adminPasswordLabel')}</label>
                            <input
                                type="password"
                                className="input"
                                placeholder={t('settings.adminPasswordPlaceholder')}
                                value={adminProfile.password}
                                onChange={e => setAdminProfile(p => ({ ...p, password: e.target.value }))}
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
                        <button type="submit" disabled={isSavingAdmin} className="btn-primary bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-8">
                            {isSavingAdmin ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isSavingAdmin ? t('common.saving') : t('settings.adminUpdateBtn')}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
