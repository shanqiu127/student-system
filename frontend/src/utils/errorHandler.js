/**
 * 后端错误消息解析工具
 * 将 axios 抛出的错误对象转化为中文提示信息
 * @param {Error} error - axios 抛出的错误对象
 * @param {string} fallback - 无法解析错误时的默认提示（默认：'操作失败，请稍后重试'）
 * @returns {string} 可直接展示给用户的中文错误提示
 */
export function extractErrorMessage(error, fallback = '操作失败，请稍后重试') {
    // 如果没有错误对象，返回默认提示
    if (!error) return fallback;

    // 获取 HTTP 响应对象
    const resp = error.response;
    // 如果没有响应对象（网络错误、超时等），使用 error.message
    if (!resp) {
        return error.message || fallback;
    }

    // 解析响应体
    const data = resp.data;

    // 处理后端直接返回字符串的情况（例如某些导入接口）
    if (typeof data === 'string') {
        // 直接返回字符串信息
        return data || fallback;
    }

    // 处理后端返回的 JSON 对象（标准错误响应格式）
    if (data && typeof data === 'object') {
        // 优先处理字段级错误（表单校验失败时返回）
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            // 在错误列表中查找关键字段（手机号、学号）的错误信息
            const fieldPreferred = data.errors.find(e =>
                typeof e === 'string' && (e.includes('phone') || e.includes('学号') || e.includes('手机号'))
            );
            // 若找到关键字段错误，优先返回；否则返回第一条错误信息
            if (fieldPreferred) return fieldPreferred;
            return String(data.errors[0]);
        }

        // 处理 message 字段（后端通用错误消息）
        if (data.message) {
            // 针对 HTTP 409（冲突）状态和学号重复的情况进行特殊处理
            if (resp.status === 409 && typeof data.message === 'string' &&
                (data.message.includes('studentNo') || data.message.includes('学号'))
            ) {
                // 返回用户友好的学号重复提示
                return '学号已存在，请更换一个新的学号';
            }
            return data.message;
        }
    }

    // 无法解析错误信息时，返回默认提示
    return fallback;
}

