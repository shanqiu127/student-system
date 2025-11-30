package com.example.studentsystem.service;

import com.example.studentsystem.model.EmailVerificationCode;
import com.example.studentsystem.repository.EmailVerificationCodeRepository;
import com.example.studentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.regex.Pattern;

/**
 * 邮箱验证服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationCodeRepository codeRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${mail.from.name:学生信息管理系统}")
    private String fromName;

    // 验证码长度
    private static final int CODE_LENGTH = 6;
    // 验证码有效期（分钟）
    private static final int CODE_VALIDITY_MINUTES = 5;
    // 最大尝试次数
    private static final int MAX_TRIES = 5;
    // 发送间隔（秒）
    private static final int SEND_INTERVAL_SECONDS = 60;
    // 每日发送上限
    private static final int DAILY_SEND_LIMIT = 10;

    // 邮箱格式验证
    private static final Pattern QQ_EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_.-]+@qq\\.com$");
    private static final Pattern NETEASE_EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_.-]+@163\\.com$");

    /**
     * 发送注册验证码
     */
    @Transactional
    public void sendRegisterCode(String email) throws Exception {
        // 1. 预处理邮箱（去除前后空格，转小写）
        email = email.trim().toLowerCase();

        // 2. 验证邮箱格式
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("邮箱格式不正确，仅支持QQ邮箱和网易邮箱");
        }

        // 3. 检查邮箱是否已注册
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("该邮箱已注册");
        }

        // 4. 检查发送频率限制
        checkSendFrequency(email, "register");

        // 5. 生成验证码
        String code = generateCode();

        // 6. 保存验证码到数据库
        saveVerificationCode(email, code, "register");

        // 7. 发送邮件
        sendEmail(email, code, "邮箱验证");

        log.info("验证码已发送到邮箱: {}", email);
    }

    /**
     * 发送重置密码验证码
     */
    @Transactional
    public void sendResetPasswordCode(String email) throws Exception {
        // 1. 预处理邮箱
        email = email.trim().toLowerCase();

        // 2. 验证邮箱格式
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("邮箱格式不正确，仅支持QQ邮箱和网易邮箱");
        }

        // 3. 检查邮箱是否已注册（重置密码需要邮箱已注册）
        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("该邮箱未注册");
        }

        // 4. 检查发送频率限制
        checkSendFrequency(email, "reset_password");

        // 5. 生成验证码
        String code = generateCode();

        // 6. 保存验证码到数据库
        saveVerificationCode(email, code, "reset_password");

        // 7. 发送邮件
        sendEmail(email, code, "重置密码");

        log.info("重置密码验证码已发送到邮箱: {}", email);
    }

    /**
     * 校验验证码
     */
    @Transactional
    public void verifyCode(String email, String code, String scene) throws Exception {
        // 预处理
        email = email.trim().toLowerCase();
        code = code.trim();

        // 查找验证码记录
        EmailVerificationCode record = codeRepository
                .findFirstByEmailAndSceneOrderByCreatedTimeDesc(email, scene)
                .orElseThrow(() -> new IllegalArgumentException("验证码不存在或已过期"));

        // 检查状态
        if (record.getStatus() == 2) {
            throw new IllegalArgumentException("验证码已失效");
        }

        // 检查是否过期
        if (record.isExpired()) {
            record.setStatus(2);
            codeRepository.save(record);
            throw new IllegalArgumentException("验证码已过期，请重新获取");
        }

        // 检查尝试次数
        if (record.isMaxTriesReached(MAX_TRIES)) {
            record.setStatus(2);
            codeRepository.save(record);
            throw new IllegalArgumentException("错误次数过多，请重新获取验证码");
        }

        // 验证码比对
        if (!code.equals(record.getCode())) {
            record.incrementTryCount();
            codeRepository.save(record);
            throw new IllegalArgumentException("验证码错误，还可尝试 " + (MAX_TRIES - record.getTryCount()) + " 次");
        }

        // 验证通过，更新状态
        record.setStatus(1);
        codeRepository.save(record);

        log.info("邮箱 {} 验证码校验成功", email);
    }

    /**
     * 验证邮箱格式（仅支持QQ和网易邮箱）
     */
    private boolean isValidEmail(String email) {
        return QQ_EMAIL_PATTERN.matcher(email).matches() || 
               NETEASE_EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * 检查发送频率
     */
    private void checkSendFrequency(String email, String scene) {
        // 检查60秒内是否已发送
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusSeconds(SEND_INTERVAL_SECONDS);
        long recentCount = codeRepository.countByEmailAndSceneAndCreatedTimeAfter(email, scene, oneMinuteAgo);
        if (recentCount > 0) {
            throw new IllegalArgumentException("操作过于频繁，请 " + SEND_INTERVAL_SECONDS + " 秒后再试");
        }

        // 检查今日发送次数
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayCount = codeRepository.countByEmailAndSceneAndCreatedTimeAfter(email, scene, todayStart);
        if (todayCount >= DAILY_SEND_LIMIT) {
            throw new IllegalArgumentException("今日发送次数已达上限");
        }
    }

    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    /**
     * 保存验证码到数据库
     */
    private void saveVerificationCode(String email, String code, String scene) {
        // 查找该邮箱在该场景下的旧记录，如果存在则作废
        codeRepository.findFirstByEmailAndSceneOrderByCreatedTimeDesc(email, scene)
                .ifPresent(oldRecord -> {
                    oldRecord.setStatus(2); // 设为失效
                    codeRepository.save(oldRecord);
                });

        // 创建新记录
        EmailVerificationCode newRecord = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .scene(scene)
                .expireTime(LocalDateTime.now().plusMinutes(CODE_VALIDITY_MINUTES))
                .tryCount(0)
                .status(0)
                .build();

        codeRepository.save(newRecord);
    }

    /**
     * 发送验证码邮件
     */
    private void sendEmail(String toEmail, String code, String scene) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromName + " <" + fromEmail + ">");
        helper.setTo(toEmail);
        helper.setSubject("【学生信息管理系统】" + scene + "验证码");

        String content = buildEmailContent(code, scene);
        helper.setText(content, true);

        mailSender.send(message);
        log.info("邮件发送成功: {} -> {}", fromEmail, toEmail);
    }

    /**
     * 构建邮件内容
     */
    private String buildEmailContent(String code, String scene) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                             color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .code-box { background: white; padding: 20px; margin: 20px 0;
                               text-align: center; border-radius: 8px;
                               border: 2px solid #667eea; }
                    .code { font-size: 32px; font-weight: bold; color: #667eea;
                           letter-spacing: 8px; }
                    .tips { color: #666; font-size: 14px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>学生信息管理系统</h1>
                        <p>" + scene + "</p>
                    </div>
                    <div class="content">
                        <p>您好！</p>
                        <p>您正在进行邮箱验证，您的验证码为：</p>
                        <div class="code-box">
                            <div class="code">""" + code + """
                            </div>
                        </div>
                        <div class="tips">
                            <p>⏰ 验证码有效期为 <strong>5 分钟</strong>，请尽快完成验证。</p>
                            <p>🔒 为了您的账号安全，请勿将验证码泄露给他人。</p>
                            <p>❓ 如果这不是您本人的操作，请忽略此邮件。</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>此邮件由系统自动发送，请勿直接回复</p>
                        <p>&copy; 2025 学生信息管理系统</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
