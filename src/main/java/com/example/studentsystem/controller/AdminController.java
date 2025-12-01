package com.example.studentsystem.controller;

import com.example.studentsystem.model.Role;
import com.example.studentsystem.repository.UserRepository;
import com.example.studentsystem.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AdminController
 * 管理员专属接口，提供系统统计信息
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")  // 只有 ROLE_ADMIN 才能访问
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public AdminController(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * GET /api/admin/stats
     * 获取系统统计信息
     * - 总用户数
     * - 普通用户数
     * - 管理员数
     * - 总学生记录数
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            logger.info("开始加载统计数据...");
            Map<String, Object> stats = new HashMap<>();
            
            // 统计用户信息
            long totalUsers = userRepository.count();
            logger.info("总用户数: {}", totalUsers);
            
            // 使用更简单的方式统计角色
            long adminUsers = 0;
            long normalUsers = 0;
            try {
                adminUsers = userRepository.countByRolesContaining(Role.ROLE_ADMIN);
                logger.info("管理员数: {}", adminUsers);
            } catch (Exception e) {
                logger.warn("统计管理员数失败: {}", e.getMessage());
            }
            
            try {
                normalUsers = userRepository.countByRolesContaining(Role.ROLE_USER);
                logger.info("普通用户数: {}", normalUsers);
            } catch (Exception e) {
                logger.warn("统计普通用户数失败: {}", e.getMessage());
            }
            
            // 统计学生记录数
            long totalStudents = studentRepository.count();
            logger.info("学生记录数: {}", totalStudents);
            
            stats.put("totalUsers", totalUsers);
            stats.put("adminUsers", adminUsers);
            stats.put("normalUsers", normalUsers);
            stats.put("totalStudents", totalStudents);
            stats.put("timestamp", LocalDateTime.now());
            
            logger.info("统计数据加载成功");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("加载统计数据失败", e);
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("totalUsers", 0);
            errorStats.put("adminUsers", 0);
            errorStats.put("normalUsers", 0);
            errorStats.put("totalStudents", 0);
            errorStats.put("error", e.getMessage());
            return ResponseEntity.ok(errorStats);
        }
    }
}
