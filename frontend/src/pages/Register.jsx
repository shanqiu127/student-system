import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { generateCaptchaCode, drawCaptcha, verifyCaptcha } from '../utils/captcha';

// 注册页面组件：采用玻璃态深色风格，对接后端注册接口
export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');//验证码输入
    const [captchaCode, setCaptchaCode] = useState('');//验证码
    const [agreedToTerms, setAgreedToTerms] = useState(false);//服务条款同意
    const [failedAttempts, setFailedAttempts] = useState(0);//失败尝试次数
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);//加载中
    const canvasRef = useRef(null);//验证码画布

    // 生成新的验证码
    const refreshCaptcha = () => {
        const newCode = generateCaptchaCode(4);
        setCaptchaCode(newCode);
        setCaptchaInput('');
        if (canvasRef.current) {
            drawCaptcha(canvasRef.current, newCode);
        }
    };

    // 组件加载时生成验证码
    useEffect(() => {
        refreshCaptcha();
    }, []);

    // 检测连续失败次数，实施临时锁定
    useEffect(() => {
        if (failedAttempts >= 5) {
            toast.error('尝试次数过多，请30秒后再试');
            const timer = setTimeout(() => {
                setFailedAttempts(0);
                refreshCaptcha();
            }, 30000);
            return () => clearTimeout(timer);
        }
    }, [failedAttempts]);

    // 提交注册表单的异步处理函数
    async function doRegister(e) {
        e.preventDefault();
        
        // 安全措施：检测连续失败次数
        if (failedAttempts >= 5) {
            toast.error('尝试次数过多，请稍后再试');
            return;
        }
        
        // 验证输入
        if (!username || !password || !confirmPassword || !captchaInput) {
            toast.error('请填写所有必填项');
            return;
        }
        
        // 安全措施：用户名格式验证（只允许字母数字下划线）
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            toast.error('用户名只能包含字母、数字、下划线，长度3-20个字符');
            return;
        }
        
        // 安全措施1：密码强度检查
        if (password.length < 6) {
            toast.error('密码至少需要6个字符');
            return;
        }
        
        // 安全措施2：密码复杂度建议
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            toast.error('为了账号安全，密码建议包含字母和数字');
            return;
        }
        
        if (password !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }
        
        // 验证码校验
        if (!verifyCaptcha(captchaInput, captchaCode)) {
            toast.error('验证码错误');
            setFailedAttempts(prev => prev + 1);
            refreshCaptcha();
            return;
        }
        
        // 服务条款同意检查
        if (!agreedToTerms) {
            toast.error('请先阅读并同意服务条款');
            return;
        }
        
        setIsLoading(true);
        
        // 向后端注册接口发送用户名/密码
        try {
            await api.post('/api/auth/register', { username, password });
            toast.success('注册成功！请登录');
            // 重置失败次数
            setFailedAttempts(0);
            // 注册成功后跳转到登录页
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.response?.data || '注册失败';
            toast.error(typeof errorMsg === 'string' ? errorMsg : '注册失败，请稍后重试');
            setFailedAttempts(prev => prev + 1);
            refreshCaptcha();
            setIsLoading(false);
        }
    }

    // 渲染注册表单 - 玻璃态深色风格
    return (
        <div className="login-root">
            {/* 氛围光效 */}
            <div className="ambient-light" />
            <div className="ambient-light-2" />

            <div className="login-wrapper">
                <div className="glass-card">
                    {/* 返回登录按钮 */}
                    <div className="back-to-login" onClick={() => navigate('/login')}>
                        <ArrowLeft size={16} />
                        <span>返回登录</span>
                    </div>

                    {/* Logo 区域 */}
                    <div className="logo-area">
                        <div className="logo-icon">🎓</div>
                        <div className="app-title">学生信息管理系统</div>
                        <div className="app-subtitle">创建您的新账户</div>
                    </div>

                    {/* 注册表单 */}
                    <form onSubmit={doRegister}>
                        <div className="form-item">
                            <div className="custom-input">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="用户名（3-20个字符，字母数字下划线）"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                    disabled={failedAttempts >= 5}
                                />
                            </div>
                        </div>
                         {/*密码输入框*/}
                        <div className="form-item">
                            <div className="custom-input">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="密码（至少6个字符，建议包含字母和数字）"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={failedAttempts >= 5}
                                />
                            </div>
                        </div>
                        {/*确认密码输入框*/}
                        <div className="form-item">
                            <div className="custom-input">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="确认密码"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={failedAttempts >= 5}
                                />
                            </div>
                        </div>

                        {/* 图形验证码 */}
                        <div className="form-item">
                            <div className="captcha-container">
                                <div className="custom-input" style={{ flex: 1 }}>
                                    <Shield className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="请输入验证码"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                                        required
                                        maxLength={4}
                                        disabled={failedAttempts >= 5}
                                    />
                                </div>
                                <div className="captcha-image-wrapper">
                                    <canvas
                                        ref={canvasRef}
                                        width={120}
                                        height={40}
                                        className="captcha-canvas"
                                        onClick={refreshCaptcha}
                                    />
                                    <button
                                        type="button"
                                        className="refresh-captcha-btn"
                                        onClick={refreshCaptcha}
                                        title="刷新验证码"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 服务条款同意 */}
                        <div className="form-item">
                            <label className="terms-checkbox">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    disabled={failedAttempts >= 5}
                                />
                                <span>
                                    我已阅读并同意
                                    <span className="link-text" onClick={() => navigate('/terms')}>
                                        《服务条款》
                                    </span>
                                </span>
                            </label>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading || failedAttempts >= 5}>
                            {isLoading ? '注册中...' : failedAttempts >= 5 ? '请稍后再试' : '注 册'}
                        </button>
                    </form>

                    {/* 底部提示 */}
                    <div className="login-footer">
                        <p className="security-tips">
                            <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            您的信息将被安全加密存储
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
