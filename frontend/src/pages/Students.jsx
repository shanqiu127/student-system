import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { clearToken } from '../utils/auth';
import StudentForm from '../components/StudentForm';
import { useNavigate } from 'react-router-dom';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, [page]);

    async function load() {
        setError('');
        try {
            const resp = await api.get('/api/students', { params: { page, size } });
            // If backend uses Page<T>, the payload is { content: [...], ... }
            setStudents(resp.data?.content || resp.data || []);
        } catch (e) {
            setError(e?.response?.data || e.message || '加载失败');
        }
    }

    async function createStudent(data) {
        try {
            await api.post('/api/students', data);
            setShowForm(false);
            load();
        } catch (e) {
            setError(e?.response?.data || e.message || '创建失败，可能需要 ADMIN 权限');
        }
    }

    function logout() {
        clearToken();
        navigate('/login');
    }

    return (
        <div className="container">
            <header>
                <h1>学生管理</h1>
                <div>
                    <button onClick={() => setShowForm((s) => !s)}>新建学生</button>
                    <button onClick={logout}>登出</button>
                </div>
            </header>

            {error && <p className="error">{String(error)}</p>}

            {showForm && <StudentForm onCancel={() => setShowForm(false)} onSubmit={createStudent} />}

            <table>
                <thead>
                <tr><th>ID</th><th>姓名</th><th>学号</th><th>邮箱</th></tr>
                </thead>
                <tbody>
                {students.map((s) => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.studentNo}</td>
                        <td>{s.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}