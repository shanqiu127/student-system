import React, { useState } from 'react';

export default function StudentForm({ onSubmit, onCancel }) {
    const [name, setName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [email, setEmail] = useState('');

    function submit(e) {
        e.preventDefault();
        onSubmit({ name, studentNo, email });
    }

    return (
        <form onSubmit={submit} className="card">
            <h3>新建学生</h3>
            <div>
                <input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <input placeholder="学号" value={studentNo} onChange={(e) => setStudentNo(e.target.value)} required />
            </div>
            <div>
                <input placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <button type="submit">创建</button>
                <button type="button" onClick={onCancel}>取消</button>
            </div>
        </form>
    );
}