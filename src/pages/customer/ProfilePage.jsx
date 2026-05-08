import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../api';
import { User, Lock, Mail, Phone, Building2, Hash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user, refreshProfile } = useAuth();

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
    });

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            await userAPI.updateProfile(profileData);
            await refreshProfile();
            toast.success(t('profile.profileUpdated'));
        } catch {
            // toast shown by interceptor
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
            return toast.error(t('profile.passwordMismatch'));
        }

        if (passwordData.newPassword.length < 6) {
            return toast.error(t('profile.passwordTooShort'));
        }

        setIsUpdatingPassword(true);
        try {
            await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success(t('profile.passwordChanged'));
            setPasswordData({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
        } catch {
            // toast shown by interceptor
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-brand-600" />
                    {t('profile.title')}
                </h2>
                <p className="text-sm text-surface-500 mt-1">{t('profile.subtitle')}</p>
            </div>

            {/* Account Type Card (Read Only details) */}
            <div className="card p-6 border-l-4 border-l-brand-500">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{t('profile.accountType')}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-surface-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.email}</p>
                            <p className="text-xs text-surface-500">{t('profile.emailLabel')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                            {user?.userType === 'CORPORATE' ? <Building2 className="w-5 h-5 text-brand-600" /> : <User className="w-5 h-5 text-brand-600" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                                {user?.userType === 'CORPORATE' ? t('profile.corporate') : t('profile.individual')}
                            </p>
                            <p className="text-xs text-surface-500">{t('profile.memberType')}</p>
                        </div>
                    </div>

                    {user?.userType === 'CORPORATE' && (
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                            <div>
                                <p className="text-sm font-bold flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {t('profile.companyName')}</p>
                                <p className="text-surface-600 dark:text-surface-400 mt-1 text-sm">{user?.companyName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold flex items-center gap-1.5"><Hash className="w-4 h-4" /> {t('profile.taxNumber')}</p>
                                <p className="text-surface-600 dark:text-surface-400 mt-1 text-sm">{user?.taxNumber}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* Profile Update Form */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{t('profile.personalInfo')}</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="label">{t('profile.firstName')}</label>
                            <input
                                required
                                className="input"
                                value={profileData.firstName}
                                onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">{t('profile.lastName')}</label>
                            <input
                                required
                                className="input"
                                value={profileData.lastName}
                                onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">{t('profile.phone')}</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-surface-400" />
                                <input
                                    className="input pl-9"
                                    value={profileData.phone}
                                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isUpdatingProfile} className="btn-primary w-full mt-2">
                            {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.updateBtn')}
                        </button>
                    </form>
                </div>

                {/* Password Update Form */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-surface-500" /> {t('profile.changePassword')}
                    </h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="label">{t('profile.currentPassword')}</label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder={t('profile.currentPasswordPlaceholder')}
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">{t('profile.newPassword')}</label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder={t('profile.newPasswordPlaceholder')}
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">{t('profile.confirmPassword')}</label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder={t('profile.confirmPasswordPlaceholder')}
                                value={passwordData.newPasswordConfirm}
                                onChange={e => setPasswordData(p => ({ ...p, newPasswordConfirm: e.target.value }))}
                            />
                        </div>

                        <button type="submit" disabled={isUpdatingPassword} className="btn-secondary w-full mt-2">
                            {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin flex mx-auto" /> : t('profile.changePasswordBtn')}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
