import React, { useEffect, useState } from 'react';
// StudentForm 组件：用于新建或编辑学生信息的表单弹窗
// Props:
// - onSubmit: 提交时调用，接收一个学生对象 { name, studentNo, phone, className }
// - onCancel: 取消/关闭时调用
// - initialStudent: 可选，编辑时传入的初始学生数据（用于预填表单）
export default function StudentForm({ onSubmit, onCancel, initialStudent }) {
    const [name, setName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [phone, setPhone] = useState(''); // 监护人手机号字段
    const [className, setClassName] = useState('');
    const [errors, setErrors] = useState({}); // 表单本地校验错误

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
        setErrors({}); // 切换时清理错误
    }, [initialStudent]);

    function validate() {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = '姓名不能为空';
        }
        if (!studentNo.trim()) {
            newErrors.studentNo = '学号不能为空';
        }
        // 手机号：非必填，但如果填了就按后端同样规则校验
        if (phone && !/^1\d{10}$/.test(phone)) {
            newErrors.phone = '监护人手机号必须是以1开头的11位数字';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function submit(e) {
        e.preventDefault();
        if (!validate()) return; // 有错误则不提交
        onSubmit({ name: name.trim(), studentNo: studentNo.trim(), phone: phone.trim(), className: className.trim() });
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <form onSubmit={submit}>
                    <h3>{initialStudent ? '编辑学生' : '新建学生'}</h3>
                    <div>
                        <input
                            placeholder="姓名"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                    <div>
                        <input
                            placeholder="学号"
                            value={studentNo}
                            onChange={(e) => setStudentNo(e.target.value)}
                            required
                        />
                        {errors.studentNo && <div className="field-error">{errors.studentNo}</div>}
                    </div>
                    <div>
                        <input
                            placeholder="监护人手机号"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        {errors.phone && <div className="field-error">{errors.phone}</div>}
                    </div>
                    <div>
                        <input
                            placeholder="班级"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <button type="submit">{initialStudent ? '保存修改' : '创建'}</button>
                        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}