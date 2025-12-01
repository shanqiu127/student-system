import React, { useState } from 'react';
import api from '../services/api';
import { saveToken, clearToken, isAdmin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
// 简约风格登录页面
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // 处理登录
    async function doLogin(e) {
        e.preventDefault();
        if (!username || !password) {
            toast.error('请输入用户名和密码');
            return;
        }
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
            saveToken(token);  // 保存 token，会自动解析并保存用户名和角色
            toast.success(`登录成功，欢迎回来！`);
            
            // 根据用户角色跳转到不同页面
            if (isAdmin()) {
                navigate('/admin');  // 管理员跳转到独立的管理控制台
            } else {
                navigate('/app/students');  // 普通用户跳转到学生管理页面
            }
        } catch (error) {
            const errorMsg = error?.response?.data || '用户名或密码错误';
            toast.error(typeof errorMsg === 'string' ? errorMsg : '登录失败');
            clearToken();
            setIsLoading(false);
        }
    }

    // 渲染简约登录表单
    return (
        <div className="login-root">
            <div className="login-wrapper">
                <div className="glass-card">
                    <div className="logo-area">
                        <div className="logo-icon">🎓</div>
                        <h1 className="app-title">学生管理系统</h1>
                    </div>
                    {/*用户名区域*/}
                    <form onSubmit={doLogin}>
                        <div className="form-item">
                            <div className="custom-input">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="用户名"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/*密码区域*/}
                        <div className="form-item">
                            <div className="custom-input">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </form>
                    {/*底部区域*/}
                    <div className="login-footer">
                        <span className="link-text" onClick={() => navigate('/register')}>注册账号</span>
                        <span className="link-separator">·</span>
                        <span className="link-text" onClick={() => navigate('/reset-password')}>忘记密码</span>
                    </div>
                </div>
            </div>
        </div>
    );
}