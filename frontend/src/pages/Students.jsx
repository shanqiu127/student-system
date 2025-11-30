import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils/errorHandler.js';
// 导入图标
import {
    Search,
    Download,
    Upload,
    GraduationCap,
    ArrowDown,
    Plus,
    Trash2
} from 'lucide-react';
import { clearToken, getUsername } from '../utils/auth';
import { useNavigate } from 'react-router-dom';


/**
 * Students 页面组件
 * 
 * 功能说明：
 * 1. 学生列表展示
 *    - 支持分页查询，可自定义每页显示数量（10/20/50条）
 *    - 显示学生的学号、姓名、性别、出生日期、班级、监护人手机号、地址、状态等信息
 *    - 提供加载中和空数据状态的友好提示
 * 
 * 2. 搜索功能
 *    - 支持按学号精确搜索
 *    - 搜索后自动重置到第一页
 *    - 显示搜索结果统计信息
 * 
 * 3. 学生管理操作
 *    - 新建学生：打开表单弹窗，填写学生信息
 *    - 编辑学生：点击编辑按钮，在弹窗中修改学生信息
 *    - 删除学生：二次确认后删除，操作不可撤销
 * 
 * 4. Excel 导入导出
 *    - 下载模板：提供标准的 Excel 导入模板下载
 *    - 批量导入：通过上传 Excel 文件快速导入多个学生信息
 *    - 支持 .xlsx 和 .xls 格式
 * 
 * 5. 分页控制
 *    - 上一页/下一页按钮切换
 *    - 页码跳转功能，支持直接输入页码或回车跳转
 *    - 显示总记录数和当前页码
 * 
 * 6. 用户交互
 *    - 顶部导航栏显示系统名称和用户信息
 *    - 用户菜单支持跳转个人主页和退出登录
 *    - 所有操作都有 loading 提示和结果反馈（toast 消息）
 * 
 * 技术要点：
 * - 使用 React Hooks 进行状态管理（useState, useEffect, useRef）
 * - 统一的错误处理机制，提取并显示友好的错误信息
 * - 响应式设计，适配不同屏幕尺寸
 * - 确认对话框组件复用，支持不同类型的确认场景
 */
export default function Students() {
    const navigate = useNavigate();
    // 列表与分页状态
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);//当前页码
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // 表单/编辑相关状态
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);//编辑学生
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const fileInputRef = useRef(null);//文件上传
    const [loading, setLoading] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);//显示用户菜单
    const [jumpPage, setJumpPage] = useState(''); // 跳转页码输入
    const [currentUsername, setCurrentUsername] = useState(''); // 当前用户名
    const [selectedIds, setSelectedIds] = useState([]); // 选中的学生ID列表
    
    // 确认对话框状态
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        onConfirm: null
    });
    // 当 page 或 keyword 或 size 改变时，重新加载数据
    useEffect(() => {
        load();
    }, [page, keyword, size]);

    // 组件加载时获取用户名
    useEffect(() => {
        const username = getUsername();
        if (username) {
            setCurrentUsername(username);
        }
    }, []);

    // 当分页变化时，清空选中状态
    useEffect(() => {
        setSelectedIds([]);
    }, [page, size]);
    // 注意：移除了 keyword 依赖，这样搜索时不会清空选中状态
    // load：从后端获取学生列表，支持分页与按学号搜索
    async function load() {
        setLoading(true);
        try {
            // 分页参数
            const params = { page, size };
            // 按学号搜索
            const trimmed = keyword.trim();
            if (trimmed) {
                params.studentNo = trimmed;
            }
            const resp = await api.get('/api/students', { params });
            const data = resp.data;
            if (data && Array.isArray(data.content)) {
                setStudents(data.content);
                setTotalPages(data?.totalPages ?? 0);
                setTotalElements(data?.totalElements ?? 0);
            } else if (Array.isArray(data)) {
                setStudents(data);
                setTotalPages(1);
                setTotalElements(data.length);
            } else {
                setStudents([]);
                setTotalPages(0);
                setTotalElements(0);
            }
            // 提示搜索结果
            if (keyword && data?.content?.length >= 0) {
                toast.success(`搜索完成，找到 ${data.totalElements || 0} 条记录`);
            }
        } catch (e) {
            console.error(e);
            toast.error('加载失败: ' + extractErrorMessage(e, '加载失败'));
        } finally {
            setLoading(false);
        }
    }
    // createStudent：调用后端创建学生，成功后刷新列表并关闭表单
    async function createStudent(data) {
        const loadingToast = toast.loading('创建中...');
        try {
            await api.post('/api/students', data);
            toast.success('学生创建成功', { id: loadingToast });
            setShowForm(false);
            // 重置表单
            setEditingStudent(null);
            await load();
        } catch (e) {
            const msg = extractErrorMessage(e, '创建失败，可能需要 ADMIN 权限');
            toast.error(msg, { id: loadingToast });
        }
    }
    // updateStudent：更新指定 editingStudent 的信息
    async function updateStudent(data) {
        if (!editingStudent) return;
        const loadingToast = toast.loading('更新中...');
        try {
            await api.put(`/api/students/${editingStudent.id}`, data);
            toast.success('信息已更新', { id: loadingToast });
            // 关闭表单
            setShowForm(false);
            setEditingStudent(null);
            await load();
        } catch (e) {
            const msg = extractErrorMessage(e, '更新失败');
            toast.error(msg, { id: loadingToast });
        }
    }
    // deleteStudent：提示确认后删除学生并刷新列表
    async function deleteStudent(id) {
        setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: '删除学生',
            message: '确认要删除该学生吗？此操作无法撤销。',
            onConfirm: async () => {
                const loadingToast = toast.loading('删除中...');
                try {
                    await api.delete(`/api/students/${id}`);
                    toast.success('删除成功', { id: loadingToast });
                    await load();
                } catch (e) {
                    const msg = extractErrorMessage(e, '删除失败');
                    toast.error(msg, { id: loadingToast });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    }

    // 处理全选/反选
    function handleSelectAll(checked) {
        if (checked) {
            const allIds = students.map(s => s.id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    }

    // 处理单个选择
    function handleSelectOne(id, checked) {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    }

    // 批量删除
    async function batchDelete() {
        if (selectedIds.length === 0) {
            toast.error('请至少选择一个学生');
            return;
        }
        setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: '批量删除学生',
            message: `确认要删除选中的 ${selectedIds.length} 个学生吗？此操作无法撤销。`,
            onConfirm: async () => {
                const loadingToast = toast.loading('批量删除中...');
                try {
                    const resp = await api.delete('/api/students/batch', {
                        data: selectedIds
                    });
                    toast.success(resp.data || '批量删除成功', { id: loadingToast });
                    setSelectedIds([]);
                    await load();
                } catch (e) {
                    const msg = extractErrorMessage(e, '批量删除失败');
                    toast.error(msg, { id: loadingToast });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    }

    // 打开新建表单
    function openCreateForm() {
        setEditingStudent(null);
        setShowForm(true);
    }
    // 打开编辑表单并传入要编辑的学生
    function openEditForm(student) {
        setEditingStudent(student);
        setShowForm(true);
    }
    // 搜索应用：重置到第一页以触发 useEffect 的 load 调用
    function applySearch() {
        setKeyword(searchInput);
        setPage(0);
    }
// 跳转到指定页
    function handleJumpPage() {
        const pageNum = parseInt(jumpPage)
        if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
            setPage(pageNum - 1); // 页码从0开始，所以要减1
            setJumpPage(''); // 清空输入框
        } else if (jumpPage) {
            toast.error(`请输入1到${totalPages}之间的页码`);
        }
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
    //处理 Excel 文件导入，使用 multipart/form-data 上传
    async function handleImport(e) {
        // 获取文件
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading('正在导入 Excel...');
        const formData = new FormData();
        // 添加文件
        formData.append('file', file);
        try {
            const resp = await api.post('/api/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(resp.data || '导入完成', { id: loadingToast });
            // 刷新列表可以看到导入的数据
            setPage(0);
            await load();
        } catch (err) {
            const msg = extractErrorMessage(err, '导入失败');
            toast.error(msg, { id: loadingToast });
        } finally {
            // 清空文件输入框
            e.target.value = '';
        }
    }
    //从后端下载模板文件（以 blob 形式），并触发浏览器下载
    async function downloadTemplate() {
        const loadingToast = toast.loading('正在下载模板...');
        try {
            const resp = await api.get('/api/students/template', {
                responseType: 'blob',
            });
            // 创建 blob 对象
            const blob = new Blob([resp.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            // 创建 URL
            const url = window.URL.createObjectURL(blob);
            // 创建 a 标签
            const a = document.createElement('a');
            a.href = url;
            a.download = 'student-import-template.xlsx';
            // 触发下载
            document.body.appendChild(a);
            a.click();
            // 释放内存
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('模板下载成功', { id: loadingToast });
        } catch (e) {
            toast.error('下载失败', { id: loadingToast });
        }
    }
    // 渲染部分：深色顶部导航栏 + 搜索/导入/模板 + 表格 + 分页
    return (
        <div className="students-page">
            {/* 顶部导航栏 */}
            <div className="header-bar">
                <div className="logo">
                    <GraduationCap size={24} />
                    <span>学生信息管理系统</span>
                </div>
                <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <div className="avatar">{currentUsername ? currentUsername.charAt(0).toUpperCase() : 'A'}</div>
                    <span>{currentUsername ? `管理员 ${currentUsername}` : '管理员'}</span>
                    <ArrowDown size={16} />
                    {showUserMenu && (
                        <div className="dropdown-menu">
                             {/*跳转个人主页*/}
                            <div className="menu-item" onClick={() => navigate('/app/dashboard')}>个人主页</div>
                            <div className="menu-divider" />
                            <div className="menu-item danger" onClick={handleLogout}>退出登录</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 主体内容 */}
            <div className="main-container">
                <div className="content-card">
                    {/* 工具栏 */}
                    <div className="toolbar">
                         {/*搜索栏*/}
                        <div className="search-area">
                            <div className="search-input-wrapper">
                                <Search className="search-prefix-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder="请输入学号查询"
                                    value={searchInput}
                                    // 两种输入方式
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                                    className="search-input"
                                />
                            </div>
                            <button className="primary-btn" onClick={applySearch}>
                                搜索
                            </button>
                        </div>
                        {/*工具栏*/}
                        <div className="action-area">
                            <button className="secondary-btn" onClick={downloadTemplate}>
                                <Download size={16} />
                                下载模版
                            </button>
                            <button className="success-btn" onClick={() => fileInputRef.current?.click()}>
                                <Upload size={16} />
                                一键导入学生
                            </button>
                            <button className="primary-btn" onClick={openCreateForm}>
                                <Plus size={16} />
                                新建学生
                            </button>
                            <button 
                                className="danger-btn" 
                                onClick={batchDelete}
                                disabled={selectedIds.length === 0}
                            >
                                <Trash2 size={16} />
                                批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
                            </button>
                            {/*一键导入*/}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={handleImport}
                            />
                        </div>
                    </div>

                    {/* 表格区域 */}
                    <div className="table-wrapper">
                        <table className="students-table">
                            <thead>
                                <tr>
                                     {/*全选*/}
                                    <th style={{ width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            className="table-checkbox"
                                            checked={students.length > 0 && selectedIds.length === students.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th>学号</th>
                                    <th>姓名</th>
                                    <th>性别</th>
                                    <th>出生日期</th>
                                    <th>班级</th>
                                    <th>监护人手机号</th>
                                    <th>地址</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="loading-cell">
                                            加载中...
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="empty-cell">
                                            暂无数据
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.id}>
                                             {/*选择框*/}
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="table-checkbox"
                                                    checked={selectedIds.includes(s.id)}
                                                    onChange={(e) => handleSelectOne(s.id, e.target.checked)}
                                                />
                                            </td>
                                            <td>{s.studentNo}</td>
                                            <td>{s.name}</td>
                                            <td>
                                                <span className={`gender-tag ${s.gender === '男' ? 'male' : 'female'}`}>
                                                    {s.gender || '-'}
                                                </span>
                                            </td>
                                            <td>{s.dob || '-'}</td>
                                            <td>{s.className || '-'}</td>
                                            <td>{s.phone || '-'}</td>
                                            <td className="address-cell" title={s.address}>{s.address || '-'}</td>
                                            <td>
                                                <span className="status-tag active">在读</span>
                                            </td>
                                            <td>
                                                <button className="link-btn primary" onClick={() => openEditForm(s)}>
                                                    编辑
                                                </button>
                                                <button className="link-btn danger" onClick={() => deleteStudent(s.id)}>
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页区域 */}
                    <div className="pagination-container">
                        <div className="pagination-info">
                            共 {totalElements} 条
                        </div>
                        <div className="pagination-controls">
                            <select 
                                value={size} 
                                onChange={(e) => { 
                                    setSize(Number(e.target.value)); 
                                    setPage(0); 
                                }}
                                className="page-size-select"
                            >
                                <option value={10}>10 条/页</option>
                                <option value={20}>20 条/页</option>
                                <option value={50}>50 条/页</option>
                            </select>
                            <button
                                className="page-btn"
                                //限制页码
                                disabled={page <= 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                上一页
                            </button>
                             {/*页码,+1，因为页码从0开始*/}
                            <span className="page-numbers">
                                <button className="page-number active">{page + 1}</button>
                            </span>
                            {/*下一页*/}
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                下一页
                            </button>
                            {/*跳转*/}
                            <span className="jump-to">
                                跳至 
                                <input 
                                    type="number" 
                                    min={1} 
                                    max={totalPages} 
                                    className="jump-input"
                                    value={jumpPage}
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleJumpPage();
                                        }
                                    }}
                                    placeholder={page + 1}
                                /> 
                                页
                                <button 
                                    className="jump-btn"
                                    onClick={handleJumpPage}
                                    disabled={!jumpPage}
                                >
                                    跳转
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 学生表单弹窗 */}
            {/*学生表单组件*/}
            {/*作用：用于新建或编辑学生信息的弹窗表单*/}
            {/*- initialStudent: 传入要编辑的学生数据，为 null则新建*/}
            {/*- onCancel: 取消按钮回调*/}
            {/*- onSubmit: 提交表单回调*/}
            {showForm && (
                <StudentForm
                    initialStudent={editingStudent}
                    onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                    onSubmit={editingStudent ? updateStudent : createStudent}
                />
            )}

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