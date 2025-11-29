import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

// 主布局：直接渲染子路由内容（顶部导航栏在各页面内）
export default function MainLayout() {
    const location = useLocation();

    // /app 直接访问时重定向到 /app/dashboard
    if (location.pathname === '/app' || location.pathname === '/app/') {
        return <Navigate to="/app/dashboard" replace />;
    }
    return <Outlet />;
}
