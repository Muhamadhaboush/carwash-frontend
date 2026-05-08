import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Building2, User, Mail, Lock, Phone, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';

export default function RegisterPage() {
    const [isCorporate, setIsCorporate] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        taxNumber: '',
        // Address sub-object
        address: {
            label: 'Ev / İş',
            street: '',
            district: '',
            city: '',
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const { registerIndividual, registerCorporate } = useAuth();
    const { isDark, toggle } = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isCorporate) {
                await registerCorporate(formData);
            } else {
                const { companyName, taxNumber, ...individualPayload } = formData;
                await registerIndividual(individualPayload);
            }
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-surface-50 dark:bg-surface-950 font-sans relative">

            {/* Header Bar */}
            <header className="absolute top-0 inset-x-0 p-4 border-b border-surface-200/50 dark:border-surface-800/50 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md flex items-center justify-between z-20">
                <Link to="/login" className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    CarWash
                </Link>
                <button onClick={toggle} className="btn-ghost p-2 rounded-full">
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </header>

            <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl bg-white dark:bg-surface-900 rounded-3xl shadow-sm border border-surface-200 dark:border-surface-800 p-6 sm:p-10 animate-scale-in">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Hesap Oluştur</h2>
                        <p className="text-surface-500">Profiliniz oluşturup hemen randevu almaya başlayın.</p>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-xl mb-8">
                        <button
                            type="button"
                            onClick={() => setIsCorporate(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${!isCorporate
                                    ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white'
                                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                                }`}
                        >
                            <User className="w-4 h-4" /> Bireysel
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCorporate(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${isCorporate
                                    ? 'bg-white dark:bg-surface-700 shadow-sm text-brand-600 dark:text-brand-400'
                                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                                }`}
                        >
                            <Building2 className="w-4 h-4" /> Kurumsal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Kişisel Bilgiler */}
                        <div>
                            <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Kişisel Bilgiler</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Ad</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} className="input" placeholder="Adınız" />
                                </div>
                                <div>
                                    <label className="label">Soyad</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} className="input" placeholder="Soyadınız" />
                                </div>
                                <div>
                                    <label className="label">E-posta</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 absolute left-3 top-2.5 text-surface-400" />
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input pl-10" placeholder="ornek@mail.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Telefon</label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 absolute left-3 top-2.5 text-surface-400" />
                                        <input required name="phone" value={formData.phone} onChange={handleChange} className="input pl-10" placeholder="05XX XXX XX XX" />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label">Şifre</label>
                                    <div className="relative">
                                        <Lock className="w-5 h-5 absolute left-3 top-2.5 text-surface-400" />
                                        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="input pl-10" placeholder="En az 6 karakter" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Kurumsal Bilgiler (Sadece Kurumsal seçiliyse) */}
                        {isCorporate && (
                            <div className="animate-fade-in">
                                <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Kurumsal Bilgiler</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Şirket Adı</label>
                                        <input required={isCorporate} name="companyName" value={formData.companyName} onChange={handleChange} className="input" placeholder="Örn: X Lojistik A.Ş." />
                                    </div>
                                    <div>
                                        <label className="label">Vergi Numarası</label>
                                        <input required={isCorporate} name="taxNumber" value={formData.taxNumber} onChange={handleChange} className="input" placeholder="10 Haneli VKN" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. İletişim / Adres */}
                        <div>
                            <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">Adres Bilgisi</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="label">Sokak / Cadde / Mahalle</label>
                                    <input required name="address.street" value={formData.address.street} onChange={handleChange} className="input" placeholder="Örn: Atatürk Mah. Vatan Cad. No:1" />
                                </div>
                                <div>
                                    <label className="label">İlçe</label>
                                    <input name="address.district" value={formData.address.district} onChange={handleChange} className="input" placeholder="Kadıköy" />
                                </div>
                                <div>
                                    <label className="label">Şehir</label>
                                    <input required name="address.city" value={formData.address.city} onChange={handleChange} className="input" placeholder="İstanbul" />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Link to="/login" className="text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition">
                                Zaten hesabınız var mı?
                            </Link>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full sm:w-auto px-8"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kayıt Ol'}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
