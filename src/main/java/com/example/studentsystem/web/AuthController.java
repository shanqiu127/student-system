// language: java
package com.example.studentsystem.web;

import com.example.studentsystem.security.jwt.JwtService;
import com.example.studentsystem.service.UserService;
import com.example.studentsystem.service.EmailVerificationService;
import com.example.studentsystem.web.dto.AuthRequest;
import com.example.studentsystem.web.dto.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController
 * 角色与职责：
 * - 提供认证相关 REST 接口：注册(register) 与 登录(login)。
 * - 与 UserService 协作：注册时调用其加密密码并保存用户。
 * - 与 AuthenticationManager 协作：登录时委托 Spring Security 执行用户名+密码认证。
 * - 与 JwtService 协作：认证通过后生成 JWT，返回给前端（前端需存储并在后续请求中附加 Authorization 头）。
 * 流程概览：
 * 1. 注册：仅业务入库，不生成 token（可按需扩展）。
 * 2. 登录：
 *    - 调用 AuthenticationManager.authenticate：内部会使用 UserService.loadUserByUsername 加载用户并比对密码。
 *    - 成功后调用 JwtService.generateToken(username) 生成基于 HS256 签名的 JWT。
 *    - 返回 AuthResponse，其中包含 token。客户端后续请求需携带该 token。
 * 与后续安全链的关系：
 * - 客户端后续请求在 Header 放置 `Authorization: Bearer <token>`。
 * - JwtAuthenticationFilter(在安全配置中注册) 会使用 JwtService.validateToken 与 extractUsername 校验并解析用户。
 * - 解析成功后把认证信息放入 SecurityContext，实现无状态认证。
 * 异常处理：
 * - 注册：若用户名已存在，UserService 抛出 IllegalArgumentException，返回 400。
 * - 登录：认证失败抛出 BadCredentialsException，返回 401。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // UserService：封装用户注册与加载（登录认证链会间接调用其 loadUserByUsername）
    private final UserService userService;
    // AuthenticationManager：Spring Security 提供的认证入口，执行用户名+密码验证
    private final AuthenticationManager authenticationManager;
    // JwtService：负责生成 JWT（登录成功后签发），与过滤器共用解析/校验逻辑
    private final JwtService jwtService;
    // EmailVerificationService：邮箱验证服务
    private final EmailVerificationService emailVerificationService;

    /**
     * 构造函数注入：
     * - 保持不可变依赖(final)。
     * - 避免字段后期被替换，提升安全与可测试性。
     */
    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          EmailVerificationService emailVerificationService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * POST /api/auth/register
     * 功能：注册新用户（授予默认普通角色，在 UserService 内实现）。
     * 输入：AuthRequest(username, password) —— 只包含基础认证信息。
     * 步骤：
     * 1. 调用 userService.register：内部做唯一性检查与密码加密。
     * 2. 成功返回 200（可扩展为返回用户概要或自动登录）。
     * 3. 若用户名占用，捕获 IllegalArgumentException 返回 400。
     * 安全注意：
     * - 不在控制器层处理密码加密，集中在服务层统一处理。
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        try {
            userService.register(req.username(), req.password(), req.email());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * POST /api/auth/login
     * 功能：用户名+密码认证并签发 JWT。
     * 输入：AuthRequest(username, password)。
     * 步骤：
     * 1. 构造 UsernamePasswordAuthenticationToken 交给 AuthenticationManager。
     *    - 内部会调用 UserService.loadUserByUsername 加载用户并使用 PasswordEncoder 校验密码。
     * 2. 若认证通过，使用 jwtService.generateToken(username) 生成带过期时间的 token。
     * 3. 返回 AuthResponse(token) 给客户端。
     * 4. 若认证失败抛出 BadCredentialsException，返回 401。
     * 后续使用：
     * - 客户端存储该 token（通常放在内存/安全的存储中），每次调用受保护接口时在 Header 添加：
     *   Authorization: Bearer <token>
     * - JwtAuthenticationFilter 会解析并设置认证上下文，实现无状态访问。
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            String token = jwtService.generateToken(req.username());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("用户名或密码错误");
        }
    }

    /**
     * POST /api/auth/reset-password
     * 功能：重置密码（需要邮箱验证）。
     * 输入：{ email, code, newPassword }
     * 步骤：
     * 1. 校验邮箱验证码是否正确且未过期。
     * 2. 验证通过后调用 userService.resetPassword 更新密码。
     * 3. 返回成功消息。
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("邮箱地址不能为空");
            }
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("验证码不能为空");
            }
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("密码至少需要6个字符");
            }

            // 1. 校验邮箱验证码
            emailVerificationService.verifyCode(email, code, "reset_password");

            // 2. 重置密码
            userService.resetPassword(email, newPassword);

            return ResponseEntity.ok("密码重置成功，请使用新密码登录");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("重置密码失败，请稍后重试");
        }
    }
}
