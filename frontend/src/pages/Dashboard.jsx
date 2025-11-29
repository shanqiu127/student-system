import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { GraduationCap, User, ArrowDown, ListTodo, Trash2, Plus } from 'lucide-react';
import { clearToken } from '../utils/auth';
/*   formatToday 函数格式化当前日期为中文格式
year: 'numeric' - 显示完整年份
month: 'long' - 显示月份全称（如"1月"）
day: 'numeric' - 显示日期数字
weekday: 'long' - 显示星期几全称（如"星期一"） */
function formatToday() {
    return new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });
}
function Dashboard() {
    const navigate = useNavigate();
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [today] = useState(formatToday);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        male: 0,
        female: 0,
        activeRate: 0,
    });
    
    // 确认对话框状态
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        onConfirm: null
    });
    // 待办事项
    useEffect(() => {
        loadTodos();
        loadStudentStats();
    }, []);
    // 加载待办事项
    async function loadTodos() {
        try {
            const resp = await api.get('/api/todos');
            setTodos(resp.data || []);
        } catch (e) {
            console.error(e);
            toast.error('加载待办事项失败');
        }
    }
    // 加载学生统计信息
    async function loadStudentStats() {
        try {
            const resp = await api.get('/api/students', { params: { page: 0, size: 1000 } });
            const data = resp.data;
            const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
            const total = list.length;
            const male = list.filter((s) => s.gender === '男').length;
            const female = list.filter((s) => s.gender === '女').length;
            // 计算学生增长率
            const activeRate = total === 0 ? 0 : Math.round(((male + female) / total) * 100);
            setStats({ totalStudents: total, male, female, activeRate });
        } catch (e) {
            console.error(e);
        }
    }
    // 添加待办事项
    async function addTodo(e) {
        e.preventDefault();
        const text = newTodo.trim();
        if (!text) return;
        try {
            const resp = await api.post('/api/todos', { text });
            setTodos((prev) => [resp.data, ...prev]);
            setNewTodo('');
            toast.success('任务已添加');
        } catch (e) {
            console.error(e);
            toast.error('添加任务失败');
        }
    }
    // 删除待办事项
    function removeTodo(id) {
        setConfirmDialog({
            isOpen: true,
            type: 'warning',
            title: '删除任务',
            message: '确认要删除这条待办事项吗？',
            onConfirm: async () => {
                try {
                    await api.delete(`/api/todos/${id}`);
                    // 从待办列表中删除
                    setTodos((prev) => prev.filter((t) => t.id !== id));
                    toast.success('任务已删除');
                } catch (e) {
                    console.error(e);
                    toast.error('删除任务失败');
                }
                // 关闭确认对话框
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    }

    // 退出登录
    function handleLogout() {
        setConfirmDialog({
            isOpen: true,
            type: 'warning',
            title: '退出登录',
            message: '确定要退出登录吗？',
            onConfirm: () => {
                clearToken();
                toast.success('已退出登录');
                navigate('/login');
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    }

    return (
        // 根容器
        <div className="students-page">

            {/* 顶部导航栏 */}
            <div className="header-bar">
                <div className="logo">
                    <GraduationCap size={24} />
                    学生信息管理系统 - 个人主页
                </div>
                {/*用户菜单*/}
                <div 
                    className="user-menu" 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div className="avatar">
                        <User size={18} />
                    </div>
                    <span>管理员</span>
                    <ArrowDown size={16} />
                    {showUserMenu && (
                        <div className="dropdown-menu">
                            <div className="menu-item" onClick={() => navigate('/app/students')}>
                                学生管理
                            </div>
                            <div className="menu-item" onClick={handleLogout}>
                                退出登录
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 主内容区 */}
            <div className="main-content">
                <div className="dashboard-container">
                    {/* 页面标题 */}
                    <div className="page-title">
                        <h1>个人主页</h1>
                        <p className="page-subtitle">{today}</p>
                    </div>

                    {/* 统计卡片区 */}
                    <div className="stats-grid">
                         {/*学生总人数卡片*/}
                        <div className="stat-card primary" onClick={() => navigate('/app/students')}>
                            <div className="stat-icon">
                                <GraduationCap size={32} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">学生总人数</div>
                                <div className="stat-value">{stats.totalStudents.toLocaleString('zh-CN')}</div>
                                <div className="stat-desc">▲ 环比上月增长 {stats.activeRate}%</div>
                            </div>
                        </div>
                         {/*男生卡片*/}
                        <div className="stat-card success">
                            <div className="stat-icon male">
                                <User size={32} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">男生</div>
                                <div className="stat-value">{stats.male}</div>
                            </div>
                        </div>
                        {/*女生卡片*/}
                        <div className="stat-card warning">
                            <div className="stat-icon female">
                                <User size={32} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">女生</div>
                                <div className="stat-value">{stats.female}</div>
                            </div>
                        </div>
                    </div>

                    {/* 待办事项区域 */}
                    <div className="todo-section">
                         {/*待办标题*/}
                        <div className="section-header">
                            <h2>待办事项</h2>
                            <span className="todo-count">共 {todos.length} 项任务</span>
                        </div>
                        <div className="todo-card">
                             {/*待办输入表单*/}
                            <form onSubmit={addTodo} className="todo-input-form">
                                <input
                                    type="text"
                                    className="todo-input"
                                    placeholder="输入新的工作任务，按回车确认..."
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                />
                                <button type="submit" className="add-todo-btn">
                                    <Plus size={18} />
                                    添加
                                </button>
                            </form>
                             {/*待办列表*/}
                            <div className="todo-list">
                                {todos.length === 0 ? (
                                    <div className="empty-state">
                                        <ListTodo size={48} />
                                        <p>暂无待力事项</p>
                                    </div>
                                ) : (
                                    todos.map((item) => (
                                        <div
                                            key={item.id}
                                            className="todo-item"
                                        >
                                            <span className="todo-text">
                                                {item.text}
                                            </span>
                                            <button
                                                className="delete-todo-btn"
                                                onClick={() => removeTodo(item.id)}
                                                title="删除任务"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 确认对话框 */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                type={confirmDialog.type}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
        </div>
    );
}

export default Dashboard;


