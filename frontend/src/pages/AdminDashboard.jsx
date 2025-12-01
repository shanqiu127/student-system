import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, UserCheck, Shield, ArrowDown } from 'lucide-react';
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
                        <div className="loading-state">加载中...</div>
                    ) : stats ? (
                        <div className="stats-grid">
                             {/*总用户统计信息*/}
                            <div className="stat-card">
                                <div className="stat-icon users">
                                    <Users size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">总用户数</div>
                                    <div className="stat-value">{stats.totalUsers}</div>
                                </div>
                            </div>
                            {/*普通用户区域*/}
                            <div className="stat-card">
                                <div className="stat-icon normal">
                                    <UserCheck size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">普通用户</div>
                                    <div className="stat-value">{stats.normalUsers}</div>
                                </div>
                            </div>
                            {/*管理员信息*/}
                            <div className="stat-card">
                                <div className="stat-icon admin">
                                    <Shield size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">管理员</div>
                                    <div className="stat-value">{stats.adminUsers}</div>
                                </div>
                            </div>
                             {/*学生信息区域*/}
                            <div className="stat-card">
                                <div className="stat-icon students">
                                    <GraduationCap size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">学生记录数</div>
                                    <div className="stat-value">{stats.totalStudents}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="error-state">加载失败，请刷新页面</div>
                    )}
                </div>
            </div>

            <style>{`
                .admin-dashboard {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                    margin: 32px 0;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                }

                .stat-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .stat-icon.users {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .stat-icon.normal {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }

                .stat-icon.admin {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                .stat-icon.students {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 8px;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #333;
                }

                .loading-state,
                .error-state {
                    text-align: center;
                    padding: 48px;
                    color: #666;
                    font-size: 16px;
                }

                .error-state {
                    color: #e53e3e;
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
