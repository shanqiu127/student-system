import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils/errorHandler.js';
import {
    Search,
    Plus,
    UploadCloud,
    FileDown,
    Edit2,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Students 页面组件：展示学生列表、搜索、分页、导入/导出模板、创建/编辑/删除等功能
export default function Students() {
    // 列表与分页状态
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    // 表单/编辑相关状态
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    // 搜索关键字与辅助 refs
    const [keyword, setKeyword] = useState('');
    const fileInputRef = useRef(null);
    // 当 page 或 keyword 改变时，重新加载数据
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, keyword]);
    // load：从后端获取学生列表，支持分页与按学号搜索
    async function load() {
        try {
            const params = { page, size };
            const trimmed = keyword.trim();
            if (trimmed) {
                params.studentNo = trimmed;
            }
            const resp = await api.get('/api/students', { params });
            const data = resp.data;
            if (data && Array.isArray(data.content)) {
                setStudents(data.content);
                setTotalPages(data.totalPages || 0);
            } else if (Array.isArray(data)) {
                setStudents(data);
                setTotalPages(1);
            } else {
                setStudents([]);
                setTotalPages(0);
            }
        } catch (e) {
            console.error(e);
            toast.error('加载失败: ' + extractErrorMessage(e, '加载失败'));
        }
    }
    // createStudent：调用后端创建学生，成功后刷新列表并关闭表单
    async function createStudent(data) {
        const loadingToast = toast.loading('创建中...');
        try {
            await api.post('/api/students', data);
            toast.success('学生创建成功', { id: loadingToast });
            setShowForm(false);
            setEditingStudent(null);
            load();
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
            setShowForm(false);
            setEditingStudent(null);
            load();
        } catch (e) {
            const msg = extractErrorMessage(e, '更新失败');
            toast.error(msg, { id: loadingToast });
        }
    }
    // deleteStudent：提示确认后删除学生并刷新列表
    async function deleteStudent(id) {
        if (!window.confirm('确认删除该学生吗？此操作无法撤销。')) return;

        const loadingToast = toast.loading('删除中...');
        try {
            await api.delete(`/api/students/${id}`);
            toast.success('删除成功', { id: loadingToast });
            load();
        } catch (e) {
            const msg = extractErrorMessage(e, '删除失败');
            toast.error(msg, { id: loadingToast });
        }
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
        setPage(0);
    }
    // 清空搜索关键字并回到第一页
    function resetSearch() {
        setKeyword('');
        setPage(0);
    }
    //处理 Excel 文件导入，使用 multipart/form-data 上传
    async function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading('正在导入 Excel...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp = await api.post('/api/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(resp.data || '导入完成', { id: loadingToast });
            setPage(0);
            load();
        } catch (err) {
            const msg = extractErrorMessage(err, '导入失败');
            toast.error(msg, { id: loadingToast });
        } finally {
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
            const blob = new Blob([resp.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'student-import-template.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('模板下载成功', { id: loadingToast });
        } catch (e) {
            toast.error('下载失败', { id: loadingToast });
        }
    }
    // 渲染部分：头部（搜索/导入/下载/新建）、表格、分页、以及条件渲染的 StudentForm 弹窗
    return (
        <div className="container">
            <header>
                <h1>学生管理系统</h1>

                <div className="actions-bar">
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="搜索学号..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                        />
                        {keyword && (
                            <X size={16} className="clear-icon" onClick={resetSearch} />
                        )}
                    </div>

                    <button onClick={() => fileInputRef.current?.click()} className="secondary">
                        <UploadCloud size={18} /> 导入
                    </button>
                    <button type="button" onClick={downloadTemplate} className="secondary">
                        <FileDown size={18} /> 模板
                    </button>
                    <button onClick={openCreateForm}>
                        <Plus size={18} /> 新建
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                />
            </header>

            {showForm && (
                <StudentForm
                    initialStudent={editingStudent}
                    onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                    onSubmit={editingStudent ? updateStudent : createStudent}
                />
            )}

            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>姓名</th>
                        <th>学号</th>
                        <th>班级</th>
                        <th>监护人手机</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                暂无数据
                            </td>
                        </tr>
                    ) : (
                        students.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.name}</td>
                                <td>{s.studentNo}</td>
                                <td>{s.className}</td>
                                <td>{s.phone}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="icon-btn edit" onClick={() => openEditForm(s)} title="编辑">
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="icon-btn delete" onClick={() => deleteStudent(s.id)} title="删除">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    className="secondary"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                    <ChevronLeft size={16} /> 上一页
                </button>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    第 {page + 1} / {totalPages || 1} 页
                </span>
                <button
                    className="secondary"
                    disabled={totalPages === 0 || page >= totalPages - 1}
                    onClick={() => setPage((p) => (totalPages ? Math.min(totalPages - 1, p + 1) : p))}
                >
                    下一页 <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}