import axios from 'axios';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────
// Axios Instance — tüm istekler bu instance üzerinden yapılır
// ──────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// ──────────────────────────────────────────────
// Request Interceptor — her isteğe JWT token ekler
// ──────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────
// Response Interceptor — hata yakalama + token yenileme
// ──────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401: Token süresi dolmuş — refresh dene
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Login veya refresh-token isteğiyse döngüye girme
            if (originalRequest.url?.includes('/auth/login')) {
                const msg = error.response?.data?.message || 'E-posta veya şifre hatalı.';
                toast.error(msg);
                return Promise.reject(error);
            }
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Bir refresh zaten devam ediyorsa kuyruğa ekle
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, null, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                processQueue(null, data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Global hata bildirimleri
        const status = error.response?.status;
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Bir hata oluştu';

        if (status === 400) {
            toast.error(message);
        } else if (status === 403) {
            toast.error('Bu işlem için yetkiniz yok.');
        } else if (status === 404) {
            toast.error('Kayıt bulunamadı.');
        } else if (status === 409) {
            toast.error(message);
        } else if (status === 429) {
            toast.error('Çok fazla istek gönderdiniz. Lütfen bekleyin.');
        } else if (status >= 500) {
            toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        }

        return Promise.reject(error);
    }
);

// ══════════════════════════════════════════════
// AUTH API
// ══════════════════════════════════════════════
export const authAPI = {
    login: (payload) => api.post('/auth/login', payload),
    registerIndividual: (payload) => api.post('/auth/register/individual', payload),
    registerCorporate: (payload) => api.post('/auth/register/corporate', payload),
    refreshToken: (token) =>
        api.post('/auth/refresh-token', null, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// ══════════════════════════════════════════════
// USER API
// ══════════════════════════════════════════════
export const userAPI = {
    getMe: () => api.get('/users/me'),
    updateProfile: (payload) => api.put('/users/me', payload),
    changePassword: (payload) => api.put('/users/me/password', payload),
};

// ══════════════════════════════════════════════
// VEHICLE API
// ══════════════════════════════════════════════
export const vehicleAPI = {
    getMyVehicles: () => api.get('/users/me/vehicles'),
    getVehicleById: (id) => api.get(`/users/me/vehicles/${id}`),
    addVehicle: (payload) => api.post('/users/me/vehicles', payload),
    updateVehicle: (id, payload) => api.put(`/users/me/vehicles/${id}`, payload),
    deleteVehicle: (id) => api.delete(`/users/me/vehicles/${id}`),
    setDefault: (id) => api.patch(`/users/me/vehicles/${id}/default`),
};

// ══════════════════════════════════════════════
// ADDRESS API
// ══════════════════════════════════════════════
export const addressAPI = {
    getMyAddresses: () => api.get('/users/me/addresses'),
    addAddress: (payload) => api.post('/users/me/addresses', payload),
    updateAddress: (id, payload) => api.put(`/users/me/addresses/${id}`, payload),
    deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
    setDefault: (id) => api.patch(`/users/me/addresses/${id}/default`),
};

// ══════════════════════════════════════════════
// APPOINTMENT API (Customer)
// ══════════════════════════════════════════════
export const appointmentAPI = {
    getAvailableSlots: (date) => api.get(`/appointments/available-slots?date=${date}`),
    create: (payload) => api.post('/appointments', payload),
    getMy: (page = 0, size = 10) => api.get(`/appointments/my?page=${page}&size=${size}`),
    getMyById: (id) => api.get(`/appointments/my/${id}`),
    cancel: (id) => api.delete(`/appointments/my/${id}`),
    reschedule: (id, payload) => api.patch(`/appointments/my/${id}/reschedule`, payload),
    pay: (id) => api.post(`/appointments/my/${id}/pay`),
};

// ══════════════════════════════════════════════
// WASH SERVICE API (Public)
// ══════════════════════════════════════════════
export const serviceAPI = {
    getActive: () => api.get('/services'),
    getById: (id) => api.get(`/services/${id}`),
};

// ══════════════════════════════════════════════
// SETTINGS API (Public)
// ══════════════════════════════════════════════
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    getByKey: (key) => api.get(`/settings/${key}`),
};

// ══════════════════════════════════════════════
// CLOSED DATES API (Public GET)
// ══════════════════════════════════════════════
export const closedDateAPI = {
    getUpcoming: () => api.get('/admin/closed-dates'),
};

// ══════════════════════════════════════════════
// ADMIN APIs
// ══════════════════════════════════════════════
export const adminAPI = {
    // Dashboard
    getStats: () => api.get('/admin/dashboard/stats'),

    // Appointments
    getAllAppointments: (status, page = 0, size = 20, yearMonth = '', search = '') => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (yearMonth) params.append('yearMonth', yearMonth);
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('size', size);
        return api.get(`/admin/appointments?${params.toString()}`);
    },
    getAppointmentById: (id) => api.get(`/admin/appointments/${id}`),
    updateAppointmentStatus: (id, payload) =>
        api.patch(`/admin/appointments/${id}/status`, payload),

    // Users
    getAllUsers: (page = 0, size = 20) => api.get(`/admin/users?page=${page}&size=${size}`),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),

    // Services
    getAllServices: () => api.get('/admin/services'),
    createService: (payload) => api.post('/admin/services', payload),
    updateService: (id, payload) => api.put(`/admin/services/${id}`, payload),
    toggleServiceStatus: (id) => api.patch(`/admin/services/${id}/status`),
    deleteService: (id) => api.delete(`/admin/services/${id}`),

    // Settings
    getSettings: () => api.get('/settings'),
    createSetting: (payload) => api.post('/admin/settings', payload),
    updateSetting: (key, payload) => api.put(`/admin/settings/${key}`, payload),
    updateSettings: async (settings) => {
        // settings objesi { businessOpenTime, businessCloseTime, concurrentSlots } formatında gelir
        const promises = [];
        if (settings.businessOpenTime !== undefined)
            promises.push(api.put('/admin/settings/businessOpenTime', { settingKey: 'businessOpenTime', settingValue: settings.businessOpenTime }));
        if (settings.businessCloseTime !== undefined)
            promises.push(api.put('/admin/settings/businessCloseTime', { settingKey: 'businessCloseTime', settingValue: settings.businessCloseTime }));
        if (settings.concurrentSlots !== undefined)
            promises.push(api.put('/admin/settings/concurrentSlots', { settingKey: 'concurrentSlots', settingValue: String(settings.concurrentSlots) }));
        return Promise.all(promises);
    },

    // Closed Dates
    getClosedDates: () => api.get('/admin/closed-dates'),
    addClosedDate: (payload) => api.post('/admin/closed-dates', payload),
    deleteClosedDate: (date) => api.delete(`/admin/closed-dates/${date}`),

    // Profile
    getMe: () => api.get('/users/me'),
    updateAdminProfile: (payload) => api.put('/admin/profile', payload),
};

// ══════════════════════════════════════════════
// COMPANY PRICE API (Admin)
// ══════════════════════════════════════════════
export const companyPriceAPI = {
    getForUser: (userId) => api.get(`/admin/users/${userId}/prices`),
    setPrice: (userId, serviceId, customPrice) =>
        api.put(`/admin/users/${userId}/prices/${serviceId}`, { customPrice }),
    removePrice: (userId, serviceId) =>
        api.delete(`/admin/users/${userId}/prices/${serviceId}`),
};

export default api;
