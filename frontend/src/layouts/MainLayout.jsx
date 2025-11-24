import React from 'react';
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { clearToken } from '../utils/auth';

// 主布局：左侧模块导航 + 右侧内容
export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const modules = [
        { path: '/app/user', label: '用户模块' },
        { path: '/app/students', label: '学生管理模块' },
        { path: '/app/scores', label: '成绩管理模块' },
        { path: '/app/analysis', label: '成绩分析模块' },
        { path: '/app/system', label: '系统管理模块' },
    ];

    function logout() {
        clearToken();
        navigate('/login', { replace: true });
    }

    // /app 直接访问时重定向到 /app/students
    if (location.pathname === '/app' || location.pathname === '/app/') {
        return <Navigate to="/app/students" replace />;
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-header">学生管理系统</div>
                <nav className="sidebar-nav">
                    {modules.map((m) => (
                        <NavLink
                            key={m.path}
                            to={m.path}
                            className={({ isActive }) =>
                                'sidebar-item' + (isActive ? ' active' : '')
                            }
                        >
                            {m.label}
                        </NavLink>
                    ))}
                </nav>
                <button className="sidebar-logout" onClick={logout}>
                    退出登录
                </button>
            </aside>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
}
