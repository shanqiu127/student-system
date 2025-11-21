import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

// Base URL loaded from Vite env (set VITE_API_BASE_URL when running), fallback to localhost:8081
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add Authorization header if token present
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401/403 globally (optional)
api.interceptors.response.use((res) => res, (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Optionally clear token on unauthorized
        clearToken();
        // Could redirect to login from UI; here we just reject so UI can handle it
    }
    return Promise.reject(error);
});

export default api;