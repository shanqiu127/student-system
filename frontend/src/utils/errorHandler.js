// 通用后端错误消息解析工具
// 输入 axios 抛出的 error 对象，输出可直接展示给用户的中文提示

export function extractErrorMessage(error, fallback = '操作失败，请稍后重试') {
    if (!error) return fallback;

    const resp = error.response;
    if (!resp) {
        return error.message || fallback;
    }

    const data = resp.data;

    // 后端直接返回字符串（例如某些导入接口）
    if (typeof data === 'string') {
        return data || fallback;
    }

    if (data && typeof data === 'object') {
        // 字段级错误优先（针对校验失败）
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            const fieldPreferred = data.errors.find(e =>
                typeof e === 'string' && (e.includes('phone') || e.includes('学号') || e.includes('手机号'))
            );
            if (fieldPreferred) return fieldPreferred;
            return String(data.errors[0]);
        }

        if (data.message) {
            // 针对学号重复的特殊提示
            if (resp.status === 409 && typeof data.message === 'string' &&
                (data.message.includes('studentNo') || data.message.includes('学号'))
            ) {
                return '学号已存在，请更换一个新的学号';
            }
            return data.message;
        }
    }

    return fallback;
}

