import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { clearToken } from '../utils/auth';
import StudentForm from '../components/StudentForm';
import { useNavigate } from 'react-router-dom';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // 统一由 useEffect 监听 page 和 keyword，任何变更都会刷新列表
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, keyword]);

    async function load() {
        setError('');
        try {
            const params = { page, size };
            const trimmed = keyword.trim();
            if (trimmed) {
                // 统一按学号模糊查询，不再根据是否为数字切换为按姓名搜索
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
            setError(e?.response?.data || e.message || '加载失败');
        }
    }

    async function createStudent(data) {
        try {
            await api.post('/api/students', data);
            setShowForm(false);
            setEditingStudent(null);
            load();
        } catch (e) {
            setError(e?.response?.data || e.message || '创建失败，可能需要 ADMIN 权限');
        }
    }

    async function updateStudent(data) {
        if (!editingStudent) return;
        try {
            await api.put(`/api/students/${editingStudent.id}`, data);
            setShowForm(false);
            setEditingStudent(null);
            load();
        } catch (e) {
            setError(e?.response?.data || e.message || '更新失败');
        }
    }

    async function deleteStudent(id) {
        if (!window.confirm('确认删除该学生吗？')) return;
        try {
            await api.delete(`/api/students/${id}`);
            load();
        } catch (e) {
            setError(e?.response?.data || e.message || '删除失败');
        }
    }

    function logout() {
        clearToken();
        navigate('/login');
    }

    function openCreateForm() {
        setEditingStudent(null);
        setShowForm(true);
    }

    function openEditForm(student) {
        setEditingStudent(student);
        setShowForm(true);
    }

    // 点击“搜索”按钮或回车：只是把页码重置为 0，由 useEffect 来触发 load
    function applySearch() {
        setPage(0);
    }

    // 点击 X：清空关键字并回到第一页，由 useEffect 触发加载“全部学生”
    function resetSearch() {
        setKeyword('');
        setPage(0);
    }

    async function handleImport(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const resp = await api.post('/api/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert(resp.data || '导入完成');
            setPage(0);
            load();
        } catch (err) {
            setError(err?.response?.data || err.message || '导入失败');
        } finally {
            e.target.value = '';
        }
    }

    async function downloadTemplate() {
        try {
            setError('');
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
        } catch (e) {
            setError(e?.response?.data || e.message || '下载模板失败');
        }
    }

    return (
        <div className="container">
            <header>
                <h1>学生管理</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ minWidth: 260 }}>
                        <input
                            type="text"
                            placeholder="按学号搜索"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                        />
                        {keyword && (
                            <div className="search-clear" onClick={resetSearch}>
                                ×
                            </div>
                        )}
                        <button type="button" className="search-button" onClick={applySearch}>
                            🔍 搜索
                        </button>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()}>Excel 一键录入</button>
                    <button type="button" onClick={downloadTemplate}>下载模板</button>
                    <button onClick={openCreateForm}>新建学生</button>
                    <button onClick={logout}>登出</button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                />
            </header>

            {error && <p className="error">{String(error)}</p>}


            {showForm && (
                <StudentForm
                    initialStudent={editingStudent}
                    onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                    onSubmit={editingStudent ? updateStudent : createStudent}
                />
            )

            }

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>姓名</th>
                        <th>学号</th>
                        <th>班级</th>
                        <th>监护人手机</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>{s.studentNo}</td>
                            <td>{s.className}</td>
                            <td>{s.phone}</td>
                            <td>
                                <button onClick={() => openEditForm(s)}>编辑</button>
                                <button onClick={() => deleteStudent(s.id)}>删除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>上一页</button>
                <span>
                    第 {page + 1} 页 / 共 {totalPages || 1} 页
                </span>
                <button
                    disabled={totalPages === 0 || page >= totalPages - 1}
                    onClick={() => setPage((p) => (totalPages ? Math.min(totalPages - 1, p + 1) : p))}
                >
                    下一页
                </button>
            </div>
        </div>
    );
}