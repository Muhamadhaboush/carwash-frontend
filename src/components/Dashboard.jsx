import { useState, useEffect } from 'react';
import { getServices, getAvailableSlots, createAppointment, getMyAppointments, cancelAppointment } from '../api.js';

function Dashboard({ user, onLogout }) {
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [showBookingForm, setShowBookingForm] = useState(false);

    useEffect(() => {
        loadServices();
        loadMyAppointments();
    }, []);

    const loadServices = async () => {
        try {
            const data = await getServices();
            setServices(data);
        } catch (err) {
            setError('Hizmetler yüklenirken hata oluştu');
        }
    };

    const loadMyAppointments = async () => {
        try {
            const data = await getMyAppointments();
            setAppointments(data.content || []);
        } catch (err) {
            setError('Randevularınız yüklenirken hata oluştu');
        }
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setSelectedTime('');
        try {
            const data = await getAvailableSlots(date);
            setAvailableSlots(data);
        } catch (err) {
            setError('Müsait saatler yüklenirken hata oluştu');
        }
    };

    const handleBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }

        setLoading(true);
        try {
            await createAppointment({
                serviceId: selectedService.id,
                vehicleId: 1, // TODO: Araç seçimi eklenecek
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                deliveryMethod: 'PICKUP' // TODO: Teslimat yöntemi seçimi eklenecek
            });
            setShowBookingForm(false);
            setSelectedService(null);
            setSelectedDate('');
            setSelectedTime('');
            loadMyAppointments();
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) return;

        try {
            await cancelAppointment(id);
            loadMyAppointments();
        } catch (err) {
            setError('Randevu iptal edilemedi');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Carwash Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Hoş geldiniz, {user.email}</span>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Services */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Hizmetler</h3>
                                <button
                                    onClick={() => setShowBookingForm(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Randevu Al
                                </button>
                            </div>
                            <div className="space-y-4">
                                {services.map(service => (
                                    <div key={service.id} className="border rounded-lg p-4">
                                        <h4 className="font-semibold">{service.name}</h4>
                                        <p className="text-gray-600 text-sm">{service.description}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-lg font-bold text-blue-600">₺{service.price}</span>
                                            <span className="text-sm text-gray-500">{service.durationMinutes} dk</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* My Appointments */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Randevularım</h3>
                            <div className="space-y-4">
                                {appointments.length === 0 ? (
                                    <p className="text-gray-500">Henüz randevunuz bulunmuyor.</p>
                                ) : (
                                    appointments.map(appointment => (
                                        <div key={appointment.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{appointment.serviceName}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(appointment.appointmentDate).toLocaleDateString('tr-TR')} - {appointment.appointmentTime}
                                                    </p>
                                                    <p className="text-sm text-gray-600">₺{appointment.price}</p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                    {appointment.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            İptal Et
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                {showBookingForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Randevu Al</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Seçin</label>
                                    <select
                                        value={selectedService?.id || ''}
                                        onChange={(e) => setSelectedService(services.find(s => s.id == e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seçin...</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>{service.name} - ₺{service.price}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Seçin</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {availableSlots.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Saat Seçin</label>
                                        <select
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seçin...</option>
                                            {availableSlots.map(slot => (
                                                <option key={slot.time} value={slot.time}>{slot.time}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleBooking}
                                        disabled={loading || !selectedService || !selectedDate || !selectedTime}
                                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Rezerve ediliyor...' : 'Rezerve Et'}
                                    </button>
                                    <button
                                        onClick={() => setShowBookingForm(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
