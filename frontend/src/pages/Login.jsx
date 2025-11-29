import React, { useState } from 'react';
import api from '../services/api';
import { saveToken, clearToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';

// 登录页面组件：对接后端登录接口
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

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
            saveToken(token);
            toast.success(`登录成功，欢迎回来！`);
            // 登录成功后跳转到主页面
            navigate('/app/students');
        } catch (error) {
            const errorMsg = error?.response?.data || '用户名或密码错误';
            toast.error(typeof errorMsg === 'string' ? errorMsg : '登录失败');
            clearToken();
            setIsLoading(false);
        }
    }

    // 渲染登录表单 - 玻璃态深色风格
    return (
        <div className="login-root">
            {/* 氛围光效 */}
            <div className="ambient-light" />
            <div className="ambient-light-2" />

            <div className="login-wrapper">
                <div className="glass-card">
                    {/* Logo 区域 */}
                    <div className="logo-area">
                        <div className="logo-icon">🎓</div>
                        <div className="app-title">学生信息管理系统</div>
                        <div className="app-subtitle">欢迎回来，请登录您的账户</div>
                    </div>

                    {/* 登录表单 */}
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
                        {/*密码输入框*/}
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
                         {/*记住我*/}
                        <div className="form-options">
                            <label className="remember-checkbox">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>记住我</span>
                            </label>
                            <span className="link-text">忘记密码?</span>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? '登录中...' : '登 录'}
                        </button>
                    </form>

                    {/* 底部提示 */}
                    <div className="login-footer">
                        <p>默认管理员账号：admin / admin</p>
                        <div className="register-link">
                            还没有账号？
                            <span className="link-text" onClick={() => navigate('/register')}>
                                立即注册
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}