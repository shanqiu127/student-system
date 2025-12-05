// key和用户名和用户的权限
const TOKEN_KEY = 'app_jwt_token';
const USERNAME_KEY = 'app_username';
const ROLES_KEY = 'app_user_roles';

/**
 * 解析 JWT Token 获取 payload 数据
 * @param {string} token - JWT token 字符串
 * @returns {Object|null} 解析后的 payload 对象，解析失败返回 null
 */
function parseJwt(token) {
    try {
        // 获取 JWT 的 payload 部分（第二部分）
        const base64Url = token.split('.')[1];
        // 将 Base64Url 编码转换为标准 Base64 编码
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // 解码 Base64 并转换为 JSON 字符串
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        // 解析 JSON 字符串并返回对象
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('解析 JWT 失败:', e);
        return null;
    }
}


/**
 * 保存 JWT Token 到本地存储
 * 同时自动解析 token 并保存用户名和角色信息
 * @param {string} token - JWT token 字符串
 */
export function saveToken(token) {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    
    // 解析 token 并保存用户名和角色
    const payload = parseJwt(token);
    if (payload) {
        if (payload.sub) {
            // 保存用户名
            localStorage.setItem(USERNAME_KEY, payload.sub);
        }
        if (payload.roles) {
            // 删除旧的角色列表
            localStorage.setItem(ROLES_KEY, JSON.stringify(payload.roles));
        }
    }
}
// 获取 JWT Token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLES_KEY);
}


export function removeToken() {
    clearToken();
}

// 获取用户名
export function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
}

// 获取用户角色列表
export function getUserRoles() {
    const rolesStr = localStorage.getItem(ROLES_KEY);
    if (!rolesStr) return [];
    try {
        return JSON.parse(rolesStr);
    } catch (e) {
        console.error('解析角色失败:', e);
        return [];
    }
}

// 检查是否是管理员
export function isAdmin() {
    const roles = getUserRoles();
    return roles.includes('ROLE_ADMIN');
}

// 检查是否已登录
export function isAuthenticated() {
    return !!getToken();
}