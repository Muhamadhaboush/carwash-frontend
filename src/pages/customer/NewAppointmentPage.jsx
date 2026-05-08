import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAPI, vehicleAPI, addressAPI, appointmentAPI } from '../../api';
import { Calendar as CalendarIcon, Clock, Car, MapPin, CheckCircle2, ChevronRight, Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function NewAppointmentPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const STEPS = [
        { id: 1, title: t('appointment.service') },
        { id: 2, title: t('appointment.vehicle') },
        { id: 3, title: t('appointment.time') },
        { id: 4, title: t('appointment.delivery') },
    ];
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data states
    const [services, setServices] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Selection states
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('SELF_DROP');
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    useEffect(() => {
        // Tomorrow as default date
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        setSelectedDate(tmr.toISOString().split('T')[0]);

        const initData = async () => {
            try {
                const [srvRes, vehRes, addrRes] = await Promise.all([
                    serviceAPI.getActive(),
                    vehicleAPI.getMyVehicles(),
                    addressAPI.getMyAddresses()
                ]);
                setServices(srvRes.data || []);
                setVehicles(vehRes.data || []);
                setAddresses(addrRes.data || []);

                const defaultVeh = vehRes.data?.find(v => v.isDefault);
                if (defaultVeh) setSelectedVehicleId(defaultVeh.id);

                const defaultAddr = addrRes.data?.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);

            } catch {
                // toast handled by interceptor
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedDate && currentStep === 3) {
            appointmentAPI.getAvailableSlots(selectedDate)
                .then(res => setAvailableSlots(res.data))
                .catch(() => setAvailableSlots([]));
        }
    }, [selectedDate, currentStep]);

    const handleNext = () => {
        if (currentStep === 1 && !selectedServiceId) return toast.error(t('appointment.selectVehicleError'));
        if (currentStep === 2 && !selectedVehicleId) return toast.error(t('appointment.selectVehicleError2'));
        if (currentStep === 3 && (!selectedDate || !selectedTime)) return toast.error(t('appointment.selectTimeError'));

        setCurrentStep(p => p + 1);
    };

    const handleBack = () => setCurrentStep(p => p - 1);

    const handleSubmit = async () => {
        if (deliveryMethod === 'VALET' && !selectedAddressId) {
            return toast.error(t('appointment.valetAddressError'));
        }

        setIsSubmitting(true);
        try {
            const res = await appointmentAPI.create({
                serviceId: selectedServiceId,
                vehicleId: selectedVehicleId,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                deliveryMethod,
                pickupAddressId: deliveryMethod === 'VALET' ? selectedAddressId : null
            });

            if (res.data.paymentRequired) {
                toast.success(t('appointment.appointmentCreated'), { duration: 5000 });
                navigate(`/payment?appointmentId=${res.data.id}`);
            } else {
                toast.success(t('appointment.appointmentSuccess'), { duration: 6000 });
                navigate('/appointments');
            }
        } catch {
            // Interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const getService = () => services.find(s => s.id === selectedServiceId);
    const getVehicle = () => vehicles.find(v => v.id === selectedVehicleId);
    const getAddress = () => addresses.find(a => a.id === selectedAddressId);

    const getFinalPrice = () => {
        const service = getService();
        const vehicle = getVehicle();
        if (!service) return 0;
        if (vehicle && service.vehiclePrices && service.vehiclePrices[vehicle.vehicleType] !== undefined && service.vehiclePrices[vehicle.vehicleType] !== null) {
            return service.vehiclePrices[vehicle.vehicleType];
        }
        return service.price || 0;
    };

    if (loading) {
        return <div className="skeleton h-[500px] w-full rounded-2xl"></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">

            {/* ── Progress Bar ── */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">{t('appointment.new')}</h2>
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-200 dark:bg-surface-800 -z-10"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 transition-all duration-300 -z-10" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>

                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep > step.id ? 'bg-brand-500 text-white' :
                                    currentStep === step.id ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900/30' :
                                        'bg-white dark:bg-surface-900 text-surface-400 border-2 border-surface-200 dark:border-surface-800'
                                }`}>
                                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? 'text-surface-900 dark:text-white' : 'text-surface-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-6 sm:p-8 animate-fade-in relative overflow-hidden min-h-[400px]">

                {/* Step 1: Hizmet */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-slide-up">
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-6">{t('appointment.selectService')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services.map(srv => (
                                <button
                                    key={srv.id}
                                    onClick={() => setSelectedServiceId(srv.id)}
                                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${selectedServiceId === srv.id
                                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                                            : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 bg-white dark:bg-surface-900'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-surface-900 dark:text-white">{srv.name}</h4>
                                        <span className="font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded text-sm">{srv.price} ₺</span>
                                    </div>
                                    <p className="text-sm text-surface-500 mb-4">{srv.description}</p>
                                    <div className="flex items-center gap-1 text-xs font-medium text-surface-400">
                                        <Clock className="w-4 h-4" /> {t('appointment.approxDuration', { minutes: srv.durationMinutes })}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Araç */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-surface-900 dark:text-white">{t('appointment.selectVehicle')}</h3>
                            <button onClick={() => navigate('/vehicles')} className="text-sm font-medium text-brand-600">{t('common.add')}</button>
                        </div>

                        {vehicles.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl">
                                <Car className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                                <p className="text-surface-600 dark:text-surface-400 mb-4">{t('appointment.noVehicles')}</p>
                                <button onClick={() => navigate('/vehicles')} className="btn-secondary">{t('appointment.goToVehicles')}</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {vehicles.map(veh => (
                                    <button
                                        key={veh.id}
                                        onClick={() => setSelectedVehicleId(veh.id)}
                                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${selectedVehicleId === veh.id
                                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                                                : 'border-surface-200 dark:border-surface-800 hover:border-brand-300 bg-white dark:bg-surface-900'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-mono font-bold text-lg text-surface-900 dark:text-white mb-1">{veh.plateNumber}</div>
                                            <div className="text-sm text-surface-500 uppercase">{veh.brand} {veh.model}</div>
                                        </div>
                                        {selectedVehicleId === veh.id && <CheckCircle2 className="w-6 h-6 text-brand-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Tarih & Saat */}
                {currentStep === 3 && (
                    <div className="animate-slide-up">
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-6">{t('appointment.selectTime')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="label flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {t('appointment.date')}</label>
                                <input
                                    type="date"
                                    className="input w-full mt-2"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]} // Bugünden öncesi seçilemez
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime('');
                                    }}
                                />
                            </div>

                            <div>
                                <label className="label flex items-center gap-2"><Clock className="w-4 h-4" /> {t('appointment.hour')}</label>

                                {selectedDate ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!slot.available}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    className={`
                            py-2 rounded-lg text-sm font-medium border
                            ${!slot.available
                                                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-400 dark:text-red-500/50 cursor-not-allowed line-through'
                                                            : selectedTime === slot.time
                                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                                : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/10'
                                                        }
                          `}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-8 text-center text-surface-500 text-sm flex flex-col items-center">
                                                <Clock className="w-6 h-6 mb-2 opacity-50" />
                                                {t('appointment.noSlots')}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl text-sm text-surface-500 flex items-center gap-2 mt-2">
                                        <Info className="w-4 h-4" /> {t('appointment.selectDateFirst')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Teslimat & Onay */}
                {currentStep === 4 && (
                    <div className="animate-slide-up">
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-6">{t('appointment.summaryTitle')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Teslimat Yöntemi */}
                            <div className="space-y-4">
                                <label className="label">{t('appointment.deliveryMethodLabel')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setDeliveryMethod('SELF_DROP')}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-colors ${deliveryMethod === 'SELF_DROP' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-surface-200 dark:border-surface-800'
                                            }`}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                                            {deliveryMethod === 'SELF_DROP' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-surface-900 dark:text-white">{t('appointment.selfDrop')}</div>
                                            <div className="text-xs text-surface-500">{t('appointment.selfDropDesc')}</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setDeliveryMethod('VALET')}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-colors ${deliveryMethod === 'VALET' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-surface-200 dark:border-surface-800'
                                            }`}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                                            {deliveryMethod === 'VALET' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-surface-900 dark:text-white">{t('appointment.valet')}</div>
                                            <div className="text-xs text-surface-500">{t('appointment.valetDesc')}</div>
                                        </div>
                                    </button>
                                </div>

                                {deliveryMethod === 'VALET' && (
                                    <div className="mt-4 animate-fade-in">
                                        <label className="label flex items-center justify-between">
                                            {t('appointment.addressSelect')}
                                            <button onClick={() => navigate('/addresses')} className="text-xs text-brand-600 underline">{t('common.add')}</button>
                                        </label>
                                        {addresses.length === 0 ? (
                                            <div className="text-sm text-red-500 mt-1">{t('appointment.noAddressForValet')}</div>
                                        ) : (
                                            <select
                                                className="select mt-2"
                                                value={selectedAddressId || ''}
                                                onChange={e => setSelectedAddressId(Number(e.target.value))}
                                            >
                                                <option value="" disabled>{t('appointment.selectAddressPlaceholder')}</option>
                                                {addresses.map(a => (
                                                    <option key={a.id} value={a.id}>{a.label} ({a.district}/{a.city})</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Özet Kartı */}
                            <div>
                                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
                                    <h4 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                                        {t('appointment.appointmentDetails')}
                                    </h4>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 pb-2">
                                            <span className="text-surface-500">{t('appointment.appointmentService')}</span>
                                            <span className="font-semibold text-surface-900 dark:text-white text-right">{getService()?.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 pb-2">
                                            <span className="text-surface-500">{t('appointment.appointmentVehicle')}</span>
                                            <span className="font-semibold text-surface-900 dark:text-white text-right font-mono">{getVehicle()?.plateNumber}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 pb-2">
                                            <span className="text-surface-500">{t('appointment.appointmentDate')}</span>
                                            <span className="font-semibold text-surface-900 dark:text-white text-right">
                                                {new Date(selectedDate).toLocaleDateString(undefined)} <br />
                                                {t('appointment.appointmentTime')}: {selectedTime.substring(0, 5)}
                                            </span>
                                        </div>
                                        {deliveryMethod === 'VALET' && (
                                            <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 pb-2">
                                                <span className="text-surface-500">{t('appointment.appointmentAddress')}</span>
                                                <span className="font-semibold text-surface-900 dark:text-white text-right">{getAddress()?.label || '-'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-between items-end">
                                        <span className="text-surface-500 font-medium">{t('appointment.totalAmount')}</span>
                                        <span className="text-3xl font-bold text-brand-600">
                                            {getFinalPrice()} ₺
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* ── Navigation Buttons ── */}
                <div className="absolute left-0 bottom-0 w-full p-4 sm:p-6 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 || isSubmitting}
                        className={`btn-ghost ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        {t('common.back')}
                    </button>

                    {currentStep < 4 ? (
                        <button onClick={handleNext} className="btn-primary">
                            {t('common.next')} <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (deliveryMethod === 'VALET' && !selectedAddressId)}
                            className="btn-primary shadow-lg shadow-brand-500/25 px-8"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('appointment.confirmBtn')}
                        </button>
                    )}
                </div>

                {/* Spacer for absolute footer */}
                <div className="h-16"></div>
            </div>
        </div>
    );
}
