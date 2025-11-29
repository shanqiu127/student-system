// ============ 导入依赖库 ============
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // React Router 用于路由管理
import { Toaster } from 'react-hot-toast'; // 全局 Toast 通知组件
import './styles.css'; // 全局样式表

// ============ 导入页面组件 ============
import Login from './pages/Login'; // 登录页面
import Register from './pages/Register'; // 注册页面
import Terms from './pages/Terms'; // 服务条款页面
import Dashboard from './pages/Dashboard'; // 仪表盘页面（需要认证）
import Students from './pages/Students'; // 学生管理页面（需要认证）

// ============ 导入工具和布局 ============
import { getToken } from './utils/auth'; // 从本地存储获取 JWT Token
import MainLayout from './layouts/MainLayout'; // 主布局组件（包含导航栏、侧边栏等）

/**
 * PrivateRoute 组件 - 路由保护
 * 检查用户是否已认证（是否存在有效的 JWT Token）
 * 如果已认证，展示受保护的组件；否则重定向到登录页面
 */
function PrivateRoute({ children }) {
    // 从本地存储获取 JWT Token
    const token = getToken();
    // 如果 Token 存在则允许访问，否则重定向到登录页
    return token ? children : <Navigate to="/login" replace />;
}

/**
 * App 主应用组件
 * 配置整个应用的路由结构和全局 Toast 通知样式
 */
function App() {
    return (
        <BrowserRouter>
            {/* ============ 全局 Toast 通知配置 ============ */}
            <Toaster
                position="top-center" // Toast 显示在页面顶部中央
                toastOptions={{
                    // 全局 Toast 样式
                    style: {
                        background: '#1e293b', // 深灰色背景
                        color: '#fff', // 白色文字
                        border: '1px solid rgba(255,255,255,0.1)', // 半透明白色边框
                    },
                    // 成功提示的图标样式（绿色）
                    success: {
                        iconTheme: {
                            primary: '#10b981', // 绿色
                            secondary: '#fff', // 白色
                        },
                    },
                    // 错误提示的图标样式（红色）
                    error: {
                        iconTheme: {
                            primary: '#ef4444', // 红色
                            secondary: '#fff', // 白色
                        },
                    },
                }}
            />
            {/* ============ 路由配置 ============ */}
            <Routes>
                {/* 公开路由 - 无需认证 */}
                <Route path="/login" element={<Login />} /> {/* 登录页面 */}
                <Route path="/register" element={<Register />} /> {/* 注册页面 */}
                <Route path="/terms" element={<Terms />} /> {/* 服务条款页面 */}
                
                {/* 受保护的路由 - 需要有效的 JWT Token */}
                <Route
                    path="/app/*" // 所有 /app 路径下的路由都需要认证
                    element={
                        <PrivateRoute>
                            <MainLayout /> {/* 包含导航栏和侧边栏的主布局 */}
                        </PrivateRoute>
                    }
                >
                    {/* 受保护路由的嵌套子路由 */}
                    <Route path="dashboard" element={<Dashboard />} /> {/* 仪表盘页面 */}
                    <Route path="students" element={<Students />} /> {/* 学生管理页面 */}
                    {/* 默认重定向到 dashboard */}
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
                
                {/* 通配符路由 - 捕获所有其他路径，重定向到仪表盘 */}
                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

// ============ 应用启动 ============
// 将 React 应用挂载到 HTML 中 id 为 'root' 的元素上
createRoot(document.getElementById('root')).render(<App />);