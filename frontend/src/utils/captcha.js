// 图形验证码生成工具
/**
 * 生成随机验证码字符串
 * @param {number} length - 验证码长度
 * @returns {string} 验证码字符串
 */
export function generateCaptchaCode(length = 4) {
    // 排除容易混淆的字符: 0, O, I, l, 1
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * 在 Canvas 上绘制验证码
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} code - 验证码文本
 */
export function drawCaptcha(canvas, code) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a103c');
    gradient.addColorStop(1, '#2a1a5e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制干扰线
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // 绘制干扰点
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // 绘制验证码文本
    const codeLen = code.length;
    const charWidth = width / (codeLen + 1);
    
    for (let i = 0; i < codeLen; i++) {
        const char = code.charAt(i);
        
        // 随机字体大小
        const fontSize = 28 + Math.random() * 8;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // 随机颜色（偏亮色）
        const r = Math.floor(Math.random() * 100 + 155);
        const g = Math.floor(Math.random() * 100 + 155);
        const b = Math.floor(Math.random() * 100 + 155);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // 随机旋转角度
        const angle = (Math.random() - 0.5) * 0.4;
        
        // 计算字符位置
        const x = charWidth * (i + 1);
        const y = height / 2 + fontSize / 3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 添加文字阴影
        ctx.shadowColor = 'rgba(0, 242, 255, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 添加边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
}

/**
 * 验证码比对（不区分大小写）
 * @param {string} input - 用户输入
 * @param {string} correct - 正确答案
 * @returns {boolean} 是否匹配
 */
export function verifyCaptcha(input, correct) {
    return input.toUpperCase() === correct.toUpperCase();
}
