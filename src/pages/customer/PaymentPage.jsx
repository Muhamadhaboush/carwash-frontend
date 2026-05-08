import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../api';
import { CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function PaymentPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const appointmentId = searchParams.get('appointmentId');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!appointmentId) {
            navigate('/appointments');
            return;
        }

        const fetchAppointment = async () => {
            try {
                const res = await appointmentAPI.getMyById(appointmentId);
                // Eğer zaten ödenmişse randevular sayfasına yönlendir
                if (res.data.isPaid) {
                    toast.success('Bu randevu zaten ödenmiş.');
                    navigate('/appointments');
                    return;
                }
                setAppointment(res.data);
            } catch (error) {
                navigate('/appointments');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId, navigate]);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            await appointmentAPI.pay(appointmentId);
            toast.success('Ödeme işleminiz başarıyla tamamlandı!', { duration: 4000 });
            navigate('/appointments');
        } catch (error) {
            // Global interceptor handles the error toast
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="skeleton h-[400px] w-full rounded-2xl max-w-lg mx-auto"></div>;
    }

    if (!appointment) return null;

    return (
        <div className="max-w-lg mx-auto py-8">
            <button onClick={() => navigate('/appointments')} className="btn-ghost mb-6 pl-0">
                <ArrowLeft className="w-5 h-5 mr-2" /> Geri Dön
            </button>

            <div className="card p-8 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                
                <div className="text-center mb-8 mt-2">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Ödeme Yap</h2>
                    <p className="text-surface-500 mt-2">Randevunuzu tamamlamak için ödeme işlemini gerçekleştirin.</p>
                </div>

                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-5 mb-8 border border-surface-200 dark:border-surface-700">
                    <div className="flex justify-between mb-3 text-sm">
                        <span className="text-surface-500">Hizmet</span>
                        <span className="font-medium text-surface-900 dark:text-white">{appointment.serviceName}</span>
                    </div>
                    <div className="flex justify-between mb-3 text-sm">
                        <span className="text-surface-500">Araç</span>
                        <span className="font-medium text-surface-900 dark:text-white">{appointment.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between mb-3 text-sm">
                        <span className="text-surface-500">Tarih</span>
                        <span className="font-medium text-surface-900 dark:text-white">
                            {new Date(appointment.appointmentDate).toLocaleDateString('tr-TR')} {appointment.appointmentTime.substring(0,5)}
                        </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-700 mt-3">
                        <span className="font-medium text-surface-900 dark:text-white">Toplam Tutar</span>
                        <span className="text-xl font-bold text-brand-600">{appointment.totalPrice} ₺</span>
                    </div>
                </div>

                <button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="btn-primary w-full py-4 text-base font-semibold flex justify-center items-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            İşleniyor...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-5 h-5" />
                            {appointment.totalPrice} ₺ Güvenli Öde
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-surface-400 mt-6 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 256-bit SSL ile güvenli ödeme
                </p>
            </div>
        </div>
    );
}
