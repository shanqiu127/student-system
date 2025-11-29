import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

// 从 Vite 环境变量读取后端基础 URL
// import.meta.env.VITE_API_BASE_URL: Vite 提供的环境变量访问方式，可在 .env 文件中配置
// 如果环境变量未设置，则默认使用 'http://localhost:8081' 作为后端服务地址
// 这种方式便于在不同环境（开发、测试、生产）中灵活切换后端地址
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

// 响应拦截器：在每次响应返回后，检查响应状态码，若为 401 或 403，则清理本地存储的 token
api.interceptors.response.use((res) => res, (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // 清理本地存储的 token，使后续请求不再携带旧 token
        clearToken();
    }
    return Promise.reject(error);
});

export default api;