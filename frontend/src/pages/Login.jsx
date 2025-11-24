import React, { useState } from 'react';
import api from '../services/api';
import { saveToken, clearToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// 登录页面组件：提交用户名/密码并处理响应 token
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // 提交表单的异步处理函数
    async function doLogin(e) {
        e.preventDefault();
        setIsLoading(true);
        // 向后端登录接口发送用户名/密码
        try {
            const resp = await api.post('/api/auth/login', { username, password });
            const token = resp.data?.token;
            if (!token) {
                toast.error('登录失败：后端未返回令牌');
                setIsLoading(false);
                return;
            }
            saveToken(token);
            toast.success(`欢迎回来, ${username}`);
            // 登录成功后跳转到学生列表页面
            navigate('/students');
        } catch (error) {
            toast.error(error?.response?.data || '用户名或密码错误');
            clearToken();
            setIsLoading(false);
        }
    }
    // 渲染登录表单
    return (
        <div className="center">
            <h2>系统登录</h2>
            <form onSubmit={doLogin}>
                <div>
                    <input
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
                        {isLoading ? '登录中...' : '立即登录'}
                    </button>
                </div>
            </form>
            <p>管理员账号：admin / admin123<br/>普通用户仅可查看列表</p>
        </div>
    );
}