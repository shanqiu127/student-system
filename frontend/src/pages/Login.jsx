import React, { useState } from 'react';
import api from '../services/api';
import { saveToken, clearToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    async function doLogin(e) {
        e.preventDefault();
        setErr('');
        try {
            const resp = await api.post('/api/auth/login', { username, password });
            const token = resp.data?.token;
            if (!token) {
                setErr('登录失败：后端未返回 token');
                return;
            }
            saveToken(token);
            navigate('/students');
        } catch (error) {
            setErr(error?.response?.data || error.message || '登录出错');
            clearToken();
        }
    }

    return (
        <div className="center">
            <h2>登录</h2>
            <form onSubmit={doLogin}>
                <div>
                    <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <button type="submit">登录</button>
                </div>
                {err && <p className="error">{String(err)}</p>}
            </form>
            <p>若要创建学生请使用管理员账号（admin/admin123）或提升当前用户权限。</p>
        </div>
    );
}