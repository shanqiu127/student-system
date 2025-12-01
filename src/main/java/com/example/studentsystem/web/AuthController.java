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
 * AuthController - 认证控制器
 * 核心职责：
 * - 提供注册、登录、重置密码等认证接口
 * - 协作组件：UserService(用户管理)、AuthenticationManager(认证)、JwtService(JWT生成)
 * 认证流程：
 * 1. 注册：加密密码后入库，不生成token
 * 2. 登录：Spring Security认证通过后生成JWT返回
 * 3. 后续请求：客户端携带 Authorization: Bearer <token>，由JwtAuthenticationFilter校验
 * 异常：注册失败400，登录失败401
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
     * 功能：用户登录认证并签发 JWT。
     * 步骤：
     * 1. 通过 AuthenticationManager 验证用户名密码。
     * 2. 认证成功后生成包含用户角色的 JWT token。
     * 3. 返回 token 给客户端，用于后续请求的 Authorization 头。
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            // 加载用户信息获取角色
            var user = userService.loadUserByUsername(req.username());
            var roles = user.getRoles().stream()
                    .map(Enum::name)
                    .toList();
            // 生成包含角色信息的 token
            String token = jwtService.generateToken(req.username(), roles);
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
