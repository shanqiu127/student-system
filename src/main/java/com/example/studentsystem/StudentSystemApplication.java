package com.example.studentsystem;

import com.example.studentsystem.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@SpringBootApplication
public class StudentSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentSystemApplication.class, args);
    }

    /**
     * 默认启用（matchIfMissing = true），但测试环境可以通过在 src/test/resources/application.properties 设置
     * app.init.enabled=false 来禁用它，避免 DataJpaTest 等 slice 测试因找不到 UserService 导致失败。
     */
    @Bean
    @ConditionalOnProperty(name = "app.init.enabled", havingValue = "true", matchIfMissing = true)
    CommandLineRunner init(UserService userService) {
        return args -> userService.ensureAdminExists("admin", "admin123");
    }

}