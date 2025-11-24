import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

// 从 Vite 环境变量读取后端基础 URL（开发时可通过 VITE_API_BASE_URL 设置）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：在每次请求发送前，检查本地是否存在 token，若存在则添加 Authorization 头
// 这样后端可以通过 Bearer token 进行鉴权
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
        // 清理本地存储的 token，使后续请求不再携带旧 token
        clearToken();
    }
    return Promise.reject(error);
});

export default api;