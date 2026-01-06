import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, UserCheck, Shield, ArrowDown, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getToken, removeToken, getUsername } from '../utils/auth';

/**
 * AdminDashboard - 管理员专属控制面板
 * 显示系统统计信息：用户数、学生数等
 */
function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);//统计数据
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);//用户菜单状态
    const currentUsername = getUsername();//当前用户名

    useEffect(() => {
        loadStats();
    }, []);
    // 加载统计数据
    const loadStats = async () => {
        try {
            setLoading(true);
            console.log('开始加载统计数据...');
            // 获取统计数据
            const response = await api.get('/api/admin/stats');
            console.log('统计数据:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('加载统计信息失败:', error);
            console.error('错误详情:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            if (error.response?.status === 403) {
                alert('权限不足，请使用管理员账户登录');
                navigate('/login');
            } else if (error.response?.status === 500) {
                alert('服务器错误，请查看后端控制台日志');
            }
        } finally {
            setLoading(false);
        }
    };
    // 退出登录
    const handleLogout = () => {
        removeToken();
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            {/* 顶部导航栏 */}
            <div className="header-bar">
                <div className="logo">
                    <Shield size={24} />
                    <span>管理员控制台</span>
                </div>
                <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <div className="avatar">{currentUsername ? currentUsername.charAt(0).toUpperCase() : 'A'}</div>
                    <span>{currentUsername ? `管理员 ${currentUsername}` : '管理员'}</span>
                    <ArrowDown size={16} />
                    {showUserMenu && (
                        <div className="dropdown-menu">
                            <div className="menu-item danger" onClick={handleLogout}>退出登录</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 主体内容 */}
            <div className="main-container">
                <div className="content-card">
                    <h2>系统概览</h2>

                    {loading ? (
                        <div className="stats-loading">
                            <div className="stats-spinner"></div>
                            <span>加载统计数据中...</span>
                        </div>
                    ) : stats ? (
                        <div className="stats-grid">
                            {/* 主要卡片 - 总用户数 */}
                            <div className="stat-card primary">
                                <div className="stat-icon">
                                    <Users size={28} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">总用户数</div>
                                    <div className="stat-value">{stats.totalUsers}</div>
                                </div>
                            </div>

                            {/* 次要卡片 - 普通用户 */}
                            <div className="stat-card secondary users">
                                <div className="stat-icon">
                                    <UserCheck size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">普通用户</div>
                                    <div className="stat-value">{stats.normalUsers}</div>
                                </div>
                            </div>

                            {/* 次要卡片 - 管理员 */}
                            <div className="stat-card secondary admin">
                                <div className="stat-icon">
                                    <Shield size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">管理员</div>
                                    <div className="stat-value">{stats.adminUsers}</div>
                                </div>
                            </div>

                            {/* 次要卡片 - 学生记录 */}
                            <div className="stat-card secondary students">
                                <div className="stat-icon">
                                    <GraduationCap size={24} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">学生记录数</div>
                                    <div className="stat-value">{stats.totalStudents}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="stats-error">
                            <div className="stats-error-icon">
                                <AlertCircle size={24} />
                            </div>
                            <div>加载失败，请刷新页面重试</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
