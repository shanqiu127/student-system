import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, Send, ArrowLeft } from 'lucide-react';

// 重置密码页面组件
export default function ResetPassword() {
    const [email, setEmail] = useState(''); // 完整邮箱地址
    const [emailCode, setEmailCode] = useState(''); // 邮箱验证码
    const [newPassword, setNewPassword] = useState(''); // 新密码
    const [confirmPassword, setConfirmPassword] = useState(''); // 确认密码
    const [emailCodeSent, setEmailCodeSent] = useState(false); // 是否已发送
    const [countdown, setCountdown] = useState(0); // 发送验证码倒计时
    const [emailVerified, setEmailVerified] = useState(false); // 邮箱是否已验证
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // 发送验证码倒计时
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 发送邮箱验证码
    const sendEmailCode = async () => {
        if (!email.trim()) {
            toast.error('请输入邮箱地址');
            return;
        }

        // 验证邮箱格式
        const emailPattern = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email.trim())) {
            toast.error('请输入正确的邮箱格式');
            return;
        }
        // 发送验证码
        try {
            const response = await api.post('/api/auth/email/code/send', { 
                email: email.trim(),
                scene: 'reset_password' // 重置密码场景
            });
            if (response.data.code === 0) {
                toast.success('验证码已发送到您的邮箱,请在 5 分钟内完成验证');
                setEmailCodeSent(true);
                setCountdown(60); // 60秒倒计时
            } else {
                toast.error(response.data.message || '验证码发送失败');
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || '验证码发送失败,请稍后重试';
            toast.error(errorMsg);
        }
    };

    // 验证邮箱验证码
    const verifyEmailCode = async () => {
        if (!emailCode.trim()) {
            toast.error('请输入邮箱验证码');
            return;
        }

        try {
            const response = await api.post('/api/auth/email/code/verify', {
                email: email.trim(),
                code: emailCode.trim(),
                scene: 'reset_password' // 指定场景为重置密码
            });

            if (response.data.code === 0) {
                toast.success('邮箱验证成功!');
                setEmailVerified(true);
            } else {
                toast.error(response.data.message || '验证码错误');
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || '验证失败,请重试';
            toast.error(errorMsg);
        }
    };

    // 提交重置密码
    async function doResetPassword(e) {
        e.preventDefault();

        // 验证输入
        if (!email || !emailCode || !newPassword || !confirmPassword) {
            toast.error('请先填写所有项');
            return;
        }

        // 邮箱验证检查
        if (!emailVerified) {
            toast.error('请先验证邮箱');
            return;
        }

        // 密码强度检查
        if (newPassword.length < 6) {
            toast.error('密码至少需要6个字符');
            return;
        }

        // 密码复杂度建议
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        if (!hasLetter || !hasNumber) {
            toast.error('为了账号安全，密码建议包含字母和数字');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }

        setIsLoading(true);
        // 发送重置密码请求
        try {
            const response = await api.post('/api/auth/reset-password', {
                email: email.trim(),
                code: emailCode.trim(),
                newPassword: newPassword
            });

            toast.success('密码重置成功！请使用新密码登录');
            // 重置成功后跳转到登录页
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            const errorMsg = error?.response?.data || '重置密码失败';
            toast.error(typeof errorMsg === 'string' ? errorMsg : '重置密码失败,请稍后重试');
            setIsLoading(false);
        }
    }

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
                        <div className="logo-icon">🔐</div>
                        <div className="app-title">重置密码</div>
                        <div className="app-subtitle">通过邮箱验证重置您的密码</div>
                    </div>

                    {/* 重置密码表单 */}
                    <form onSubmit={doResetPassword}>
                        {/* 邮箱输入 */}
                        <div className="form-item">
                            <div className="custom-input">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    placeholder="邮箱地址"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={emailVerified}
                                />
                            </div>
                        </div>

                        {/* 邮箱验证码 */}
                        <div className="form-item">
                            <div className="email-code-group">
                                <div className="custom-input" style={{ flex: 1 }}>
                                    <Shield className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="验证码"
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value)}
                                        required
                                        maxLength={6}
                                        disabled={emailVerified}
                                    />
                                </div>
                                {!emailVerified ? (
                                    <>
                                        <button
                                            type="button"
                                            className="send-code-btn"
                                            onClick={sendEmailCode}
                                            disabled={countdown > 0}
                                        >
                                            <Send size={16} />
                                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                        </button>
                                        {emailCodeSent && (
                                            <button
                                                type="button"
                                                className="verify-code-btn"
                                                onClick={verifyEmailCode}
                                            >
                                                验证
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span className="verified-badge">✔ 已验证</span>
                                )}
                            </div>
                        </div>

                        {/* 新密码 */}
                        <div className="form-item">
                            <div className="custom-input">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="新密码"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={!emailVerified}
                                />
                            </div>
                        </div>

                        {/* 确认密码 */}
                        <div className="form-item">
                            <div className="custom-input">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    placeholder="确认新密码"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={!emailVerified}
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading || !emailVerified}>
                            {isLoading ? '重置中...' : '重置密码'}
                        </button>
                    </form>

                    {/* 底部提示 */}
                    <div className="login-footer">
                        <p className="security-tips">
                            <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            请确保邮箱地址为您注册时使用的邮箱
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
