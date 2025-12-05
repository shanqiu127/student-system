import React, { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';

// StudentForm 组件：用于新建或编辑学生信息的表单弹窗
// Props:
// - onSubmit: 提交时调用，接收一个学生对象
// - onCancel: 取消/关闭时调用
// - initialStudent: 可选，编辑时传入的初始学生数据（用于预填表单）
export default function StudentForm({ onSubmit, onCancel, initialStudent }) {
    const [name, setName] = useState('');
    const [studentNo, setStudentNo] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState(''); // 出生日期 (yyyy-MM-dd)
    const [phone, setPhone] = useState('');
    const [className, setClassName] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({}); // 表单错误
    const [showDatePicker, setShowDatePicker] = useState(false);// 日期选择器

    // 编辑时，用 initialStudent 预填表单
    useEffect(() => {
        if (initialStudent) {
            setName(initialStudent.name || '');
            setStudentNo(initialStudent.studentNo || '');
            setGender(initialStudent.gender || '');
            setDob(initialStudent.dob || '');
            setPhone(initialStudent.phone || '');
            setClassName(initialStudent.className || '');
            setAddress(initialStudent.address || '');
        } else {
            setName('');
            setStudentNo('');
            setGender('');
            setDob('');
            setPhone('');
            setClassName('');
            setAddress('');
        }
        setErrors({}); // 切换时清理错误
    }, [initialStudent]);
    // 表单校验
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
        // 出生日期：非必填，但如果填了需要在2000年到当前日期之间
        if (dob) {
            const dobDate = new Date(dob);
            const today = new Date();
            const minDate = new Date('2000-01-01');
            if (dobDate >= today) {
                newErrors.dob = '出生日期必须是过去的日期';
            } else if (dobDate < minDate) {
                newErrors.dob = '出生日期不能早于2000年';
            }
        }
        setErrors(newErrors);
        // 没有错误则提交
        return Object.keys(newErrors).length === 0;
    }
    // 提交表单
    function submit(e) {
        // 阻止表单默认提交
        e.preventDefault();
        if (!validate()) return; // 有错误则不提交
        onSubmit({
            name: name.trim(),
            studentNo: studentNo.trim(),
            gender: gender || null,
            dob: dob || null,
            phone: phone.trim() || null,
            className: className.trim() || null,
            address: address.trim() || null
        });
    }

    // 快速选择年份
    const currentYear = new Date().getFullYear();
    const quickYears = [
        { label: '2015年 (10岁)', year: 2015 },
        { label: '2010年 (15岁)', year: 2010 },
        { label: '2005年 (20岁)', year: 2005 },
        { label: '2000年 (25岁)', year: 2000 },
    ];
    // 渲染表单
    return (
        // 模态框
        <div className="modal-overlay" onClick={onCancel}>
            {/*表单卡片，阻止点击冒泡关闭弹窗*/}
            <div className="modal-card student-form-card" onClick={(e) => e.stopPropagation()}>
                {/*标题栏*/}
                <div className="modal-header">
                    <h3>{initialStudent ? '编辑学生信息' : '新建学生'}</h3>
                     {/*关闭按钮*/}
                    <button type="button" className="close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="form-grid">
                        {/* 第一行：姓名、学号 */}
                        <div className="form-field">
                            <label>姓名 <span className="required">*</span></label>
                            <input
                                type="text"
                                placeholder="请输入学生姓名"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {/* 错误信息*/}
                            {errors.name && <div className="field-error">{errors.name}</div>}
                        </div>
                        
                        <div className="form-field">
                            <label>学号 <span className="required">*</span></label>
                            <input
                                type="text"
                                placeholder="请输入学号"
                                value={studentNo}
                                onChange={(e) => setStudentNo(e.target.value)}
                                required
                            />
                            {/*错误信息*/}
                            {errors.studentNo && <div className="field-error">{errors.studentNo}</div>}
                        </div>

                        {/* 第二行：性别(选择类型)、出生日期(输入、选择) */}
                        <div className="form-field">
                            <label>性别</label>
                            <select 
                                value={gender} 
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">请选择性别</option>
                                <option value="男">男</option>
                                <option value="女">女</option>
                            </select>
                        </div>

                        <div className="form-field date-field">
                            <label>出生日期</label>
                            <div className="date-input-wrapper">
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    onWheel={(e) => {
                                        // 高灵敏度滚轮：每次滚动增减1年，快速滚动时按月调整
                                        e.preventDefault();
                                        if (!dob) return;
                                        const currentDate = new Date(dob);
                                        
                                        // 根据滚动速度动态调整：快速滚动=按年，慢速滚动=按月
                                        const isQuickScroll = Math.abs(e.deltaY) > 50;
                                        let delta;
                                        
                                        if (isQuickScroll) {
                                            // 快速滚动：每次1年
                                            delta = e.deltaY > 0 ? -365 : 365;
                                        } else {
                                            // 慢速滚动：每次3个月
                                            delta = e.deltaY > 0 ? -90 : 90;
                                        }
                                        
                                        currentDate.setDate(currentDate.getDate() + delta);
                                        const newDate = currentDate.toISOString().split('T')[0];
                                        
                                        // 限制在2000年到今天之间
                                        const minDate = '2000-01-01';
                                        const maxDate = new Date().toISOString().split('T')[0];
                                        if (newDate >= minDate && newDate <= maxDate) {
                                            setDob(newDate);
                                        } else if (newDate < minDate) {
                                            setDob(minDate); // 自动设置为最小值
                                        } else if (newDate > maxDate) {
                                            setDob(maxDate); // 自动设置为最大值
                                        }
                                    }}
                                    // 最小可选日期: 2000年1月1日
                                    min="2000-01-01"
                                    // 最大可选日期: 当前日期今天
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                <button 
                                    type="button" 
                                    className="date-picker-btn"
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <Calendar size={16} />
                                </button>
                                 {/*日期选择器 快速选择日期*/}
                                {showDatePicker && (
                                    <div className="quick-date-picker">
                                        <div className="picker-header">快速选择</div>
                                        {quickYears.map(item => (
                                            <button
                                                key={item.year}
                                                type="button"
                                                className="quick-year-btn"
                                                onClick={() => {
                                                    setDob(`${item.year}-01-01`);
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.dob && <div className="field-error">{errors.dob}</div>}
                        </div>

                        {/* 第三行：班级、监护人手机号 */}
                        <div className="form-field">
                            <label>班级</label>
                            <input
                                type="text"
                                placeholder="请输入班级"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label>监护人手机号</label>
                            <input
                                type="tel"
                                placeholder="请输入监护人手机号"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            {errors.phone && <div className="field-error">{errors.phone}</div>}
                        </div>

                        {/* 第四行：地址（跨两列） */}
                        <div className="form-field full-width">
                            <label>地址</label>
                            <input
                                type="text"
                                placeholder="请输入详细地址"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* 第五行：操作按钮*/}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            取消
                        </button>
                        <button type="submit" className="submit-btn">
                            {initialStudent ? '保存修改' : '立即创建'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}