package com.example.studentsystem.repository;

import com.example.studentsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
// 是一个 Spring Data JPA 的 "仓库" 接口，声明了对 User 实体的持久化操作
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    // 检查邮箱地址是否已存在
    boolean existsByEmail(String email);
}
