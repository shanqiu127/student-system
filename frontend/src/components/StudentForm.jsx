import React, { useEffect, useState } from 'react';

export default function StudentForm({ onSubmit, onCancel, initialStudent }) {
    const [name, setName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [phone, setPhone] = useState(''); // 监护人手机号字段
    const [className, setClassName] = useState('');

    // 当用于编辑时，用 initialStudent 预填表单
    useEffect(() => {
        if (initialStudent) {
            setName(initialStudent.name || '');
            setStudentNo(initialStudent.studentNo || '');
            setPhone(initialStudent.phone || '');
            setClassName(initialStudent.className || '');
        } else {
            setName('');
            setStudentNo('');
            setPhone('');
            setClassName('');
        }
    }, [initialStudent]);

    function submit(e) {
        e.preventDefault();
        onSubmit({ name, studentNo, phone, className });
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <form onSubmit={submit}>
                    <h3>{initialStudent ? '编辑学生' : '新建学生'}</h3>
                    <div>
                        <input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <input placeholder="学号" value={studentNo} onChange={(e) => setStudentNo(e.target.value)} required />
                    </div>
                    <div>
                        <input
                            placeholder="监护人手机号"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <input placeholder="班级" value={className} onChange={(e) => setClassName(e.target.value)} />
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <button type="submit">{initialStudent ? '保存修改' : '创建'}</button>
                        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>取消</button>
                    </div>
                </form>
            </div>
        </div>
    );
}