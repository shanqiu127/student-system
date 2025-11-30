//用于管理JWT令牌和用户名的存储和检索在本地存储中
const TOKEN_KEY = 'app_jwt_token';
const USERNAME_KEY = 'app_username';

export function saveToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

export function saveUsername(username) {
    if (!username) return;
    localStorage.setItem(USERNAME_KEY, username);
}

export function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
}