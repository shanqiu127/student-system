import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles.css';
import Login from './pages/Login';
import Students from './pages/Students';
import { getToken } from './utils/auth';
import MainLayout from './layouts/MainLayout';
import UserModulePlaceholder from './pages/UserModulePlaceholder';
import ScoresModulePlaceholder from './pages/ScoresModulePlaceholder';
import AnalysisModulePlaceholder from './pages/AnalysisModulePlaceholder';
import SystemModulePlaceholder from './pages/SystemModulePlaceholder';

// PrivateRoute 组件用于保护需要认证的路由
function PrivateRoute({ children }) {
    const token = getToken();
    return token ? children : <Navigate to="/login" replace />;
}

// 主应用组件，配置路由和全局 Toast
function App() {
    return (
        <BrowserRouter>
            {/* Configure Global Toast */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/app/*"
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="user" element={<UserModulePlaceholder />} />
                    <Route path="students" element={<Students />} />
                    <Route path="scores" element={<ScoresModulePlaceholder />} />
                    <Route path="analysis" element={<AnalysisModulePlaceholder />} />
                    <Route path="system" element={<SystemModulePlaceholder />} />
                    <Route index element={<Navigate to="students" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/app/students" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

// 渲染应用到 DOM
createRoot(document.getElementById('root')).render(<App />);