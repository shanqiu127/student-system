package com.example.studentsystem.controller;

import com.example.studentsystem.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 邮箱验证控制器
 */
@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    /**
     * 发送邮箱验证码
     */
    @PostMapping("/code/send")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String scene = request.get("scene"); // register 或 reset_password
            
            if (email == null || email.trim().isEmpty()) {
                response.put("code", 1001);
                response.put("message", "邮箱地址不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 根据场景调用不同的方法
            if ("reset_password".equals(scene)) {
                emailVerificationService.sendResetPasswordCode(email);
            } else {
                emailVerificationService.sendRegisterCode(email);
            }
            
            response.put("code", 0);
            response.put("message", "验证码已发送");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // 业务异常
            int errorCode = getErrorCode(e.getMessage());
            response.put("code", errorCode);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("发送验证码失败", e);
            response.put("code", 1500);
            response.put("message", "邮件服务异常，请稍后再试");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 校验邮箱验证码
     */
    @PostMapping("/code/verify")
    public ResponseEntity<Map<String, Object>> verifyCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String code = request.get("code");
            String scene = request.get("scene"); // 获取场景参数
            
            if (email == null || email.trim().isEmpty()) {
                response.put("code", 2001);
                response.put("message", "邮箱地址不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (code == null || code.trim().isEmpty()) {
                response.put("code", 2001);
                response.put("message", "验证码不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 如果没有传scene参数，默认为register（兼容旧代码）
            if (scene == null || scene.trim().isEmpty()) {
                scene = "register";
            }
            
            emailVerificationService.verifyCode(email, code, scene);
            
            response.put("code", 0);
            response.put("message", "验证通过");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            int errorCode = getVerifyErrorCode(e.getMessage());
            response.put("code", errorCode);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            log.error("验证码校验失败", e);
            response.put("code", 2004);
            response.put("message", "验证失败，请稍后再试");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 根据错误消息判断错误码（发送验证码）
     */
    private int getErrorCode(String message) {
        if (message.contains("格式") || message.contains("支持")) {
            return 1001; // 邮箱格式错误
        } else if (message.contains("已注册")) {
            return 1002; // 邮箱已注册
        } else if (message.contains("频繁") || message.contains("上限")) {
            return 1003; // 频率限制
        }
        return 1500; // 其他错误
    }

    /**
     * 根据错误消息判断错误码（验证验证码）
     */
    private int getVerifyErrorCode(String message) {
        if (message.contains("错误")) {
            return 2001; // 验证码错误
        } else if (message.contains("过期") || message.contains("不存在")) {
            return 2002; // 验证码过期/不存在
        } else if (message.contains("次数") || message.contains("失效")) {
            return 2003; // 错误次数超限
        }
        return 2004; // 其他错误
    }
}
