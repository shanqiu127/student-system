//用于管理JWT令牌的存储和检索在本地存储中
const TOKEN_KEY = 'app_jwt_token';

export function saveToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}