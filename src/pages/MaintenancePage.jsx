import React from 'react';
import { Hammer, Clock, Phone, Mail } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center animate-bounce">
                        <Hammer className="w-12 h-12 text-brand-600" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-surface-900 dark:text-white tracking-tight">
                        Bakım Modundayız
                    </h1>
                    <p className="text-lg text-surface-600 dark:text-surface-400">
                        Size daha iyi hizmet verebilmek için sistemimizde kısa süreli bir çalışma yapıyoruz.
                    </p>
                </div>

                <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl shadow-xl shadow-brand-500/5 border border-surface-200 dark:border-surface-800 space-y-6">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-surface-900 dark:text-white">Tahmini Süre</h3>
                            <p className="text-sm text-surface-500">Yaklaşık 30 dakika içinde geri döneceğiz.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-surface-100 dark:border-surface-800">
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Bize Ulaşın</h3>
                        <div className="flex flex-col gap-3">
                            <a href="tel:05334762899" className="flex items-center gap-3 text-surface-600 dark:text-surface-300 hover:text-brand-600 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>0533 476 28 99</span>
                            </a>
                            <a href="mailto:support@nygcarwash.com" className="flex items-center gap-3 text-surface-600 dark:text-surface-300 hover:text-brand-600 transition-colors">
                                <Mail className="w-4 h-4" />
                                <span>support@nygcarwash.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-surface-400">
                    Anlayışınız için teşekkür ederiz. — NYG Auto Garage Ekibi
                </p>
            </div>
        </div>
    );
}
