package com.example.studentsystem.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;

/**
  采用HMAC对称签名密钥 Key认证.
 * 2. 生成包含主体 subject(用户名) 发行时间和过期时间的 JWT.
 * 3. 解析 token 提取用户名(Subject).
 * 4. 校验 token 签名 完整性 与是否过期
 * 设计要点:
 * - 使用 @Service 作为 Spring Bean 注入.
 * - 通过 @Value 注入配置源
 * - 若 secret 未提供或不符合HS256强度要求 自动生成临时密钥 并记录警告日志 仅适用于开发.
* 安全注意:
 * - 生产环境必须提供长度足够的 secret (建议至少 32 字节 或 base64 编码后长度满足要求).
 * - 临时生成的密钥重启后会变化 导致之前发出的 token 全部失效.
 * - 在开发之后将密钥放在环境变量或外部配置中心.
 */
@Service
public class JwtService {

    // 日志记录器 用于输出初始化与错误信息
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    // 签名用的对称密钥 (HS256)
    private Key key;

    // 注入的原始密钥字符串 (可能为空)
    private final String secret;

    // token 过期毫秒数 (默认 24 小时) 可配置
    private final long jwtExpirationMs;

    /**
     * 构造函数
     *
     * @param secret          从配置中读取的密钥字符串 app.jwt.secret
     * @param jwtExpirationMs token 过期毫秒数（24h） app.jwt.expiration-ms
     * 处理:
     * - 使用 Optional 去除 null 并 trim 空白.
     * - 不在此处直接生成 Key 而放到 @PostConstruct 方法 便于捕获异常与日志输出.
     */
    public JwtService(@Value("${app.jwt.secret:}") String secret,
                      @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs) {
        this.secret = Optional.ofNullable(secret).orElse("").trim();
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * initKey
     * 生命周期钩子在Bean初始化完成后执行.
     * 逻辑:
     * 1. 若未提供 secret 则警告并生成临时随机 HS256 密钥.
     * 2. 若提供则按 UTF-8 获取字节并调用 Keys.hmacShaKeyFor 构建 Key.
     * 3. 捕获 WeakKeyException 或 IllegalArgumentException 若强度不足则退化为临时密钥并提示需使用至少 32 字节.
     * 4. 捕获任何其它异常 仍生成临时密钥 保证服务可启动.
     * 风险:
     * - 临时密钥重启即失效 不适合生产.
     */
    @PostConstruct
    private void initKey() {
        try {
            if (secret.isEmpty()) {
                logger.warn("app.jwt.secret 为空 生成临时签名密钥 仅用于开发 请在生产设置强密钥");
                this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            } else {
                // 使用原始字符串字节作为 HMAC Key (若需要更安全 可使用 base64 解码后字节)
                byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
                this.key = Keys.hmacShaKeyFor(keyBytes);
            }
            logger.info("JWT 签名密钥初始化成功 算法: {}", key.getAlgorithm());
        } catch (IllegalArgumentException | WeakKeyException ex) {
            logger.error("提供的 app.jwt.secret 不符合 HS256 要求: {} 使用临时密钥启动 请提供至少 32 字节强密钥", ex.getMessage());
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } catch (Exception ex) {
            logger.error("初始化 JWT 密钥出现未预期异常 使用临时密钥继续启动 错误: ", ex);
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    /**
     * @param username 作为 JWT 的 Subject (主体用户)
     * @return 已签名并包含过期时间的紧凑型 JWT 字符串
     * - 创建当前时间:now;过期时间:exp
     * -构建前端返回的token
    */
    public String generateToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * extractUsername
     * @param token 外部传入的 JWT
     * @return token 中的 Subject (用户名)
     * 说明:
     * - parseClaimsJws 会在签名不匹配、过期 、格式错误时抛出 JwtException.
     * - 调用方可在外层捕获异常 或在过滤器中 try-catch 后忽略处理.
     */
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * validateToken
     *
     * @param token 待校验 JWT
     * @return true 表示通过签名与格式校验且未过期 false 表示解析失败或不合法
     * 说明:
     * - 仅做基础校验 (签名 时间 格式).
     * - 若需要与用户状态联动 (例如用户已禁用) 可在外层结合 UserDetails 再做逻辑判断.
     * - 捕获所有 JwtException 子类 并记录调试日志 避免泄漏过多信息.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            logger.debug("JWT 校验失败: {}", ex.getMessage());
            return false;
        }
    }
}
