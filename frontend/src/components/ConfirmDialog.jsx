import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

/**
 * 确认对话框组件
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否显示对话框
 * @param {string} props.title - 标题
 * @param {string} props.message - 消息内容
 * @param {string} props.type - 类型：'warning' | 'info' | 'success' | 'danger'
 * @param {string} props.confirmText - 确认按钮文字
 * @param {string} props.cancelText - 取消按钮文字
 * @param {function} props.onConfirm - 确认回调
 * @param {function} props.onCancel - 取消回调
 */
export default function ConfirmDialog({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmText = '确定',
    cancelText = '取消',
    onConfirm,
    onCancel
}) {
    if (!isOpen) return null;
    // 图标
    const icons = {
        warning: <AlertTriangle size={48} />,
        info: <Info size={48} />,
        success: <CheckCircle size={48} />,
        danger: <XCircle size={48} />
    };
    // 图标颜色
    const iconColors = {
        warning: '#E6A23C',
        info: '#409EFF',
        success: '#67C23A',
        danger: '#F56C6C'
    };
    // 渲染确认对话框
    return (
        <div className="confirm-overlay" onClick={onCancel}>
             {/*对话框*/}
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                {/*图标*/}
                <div className="confirm-icon" style={{ color: iconColors[type] }}>
                    {icons[type]}
                </div>
                <div className="confirm-content">
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>
                </div>
                <div className="confirm-actions">
                    {/*取消按钮*/}
                    <button 
                        className="confirm-cancel-btn" 
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                     {/*确认按钮*/}
                    <button 
                        className={`confirm-ok-btn confirm-${type}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
