package com.example.studentsystem.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 邮箱验证码实体类
 */
@Entity
@Table(name = "email_verification_code")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationCode {

    @Id
    //自增主键
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 邮箱地址（小写存储）
     */
    @Column(nullable = false)
    private String email;

    /**
     * 6位验证码
     */
    @Column(nullable = false, length = 6)
    private String code;

    /**
     * 业务场景：register（注册）、reset_password（重置密码）
     */
    @Column(nullable = false, length = 50)
    private String scene;

    /**
     * 过期时间
     */
    @Column(nullable = false)
    private LocalDateTime expireTime;

    /**
     * 尝试验证的次数
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer tryCount = 0;

    /**
     * 状态：0=未使用，1=已通过，2=失效/已过期
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer status = 0;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    @Column(nullable = false)
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
        updatedTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }

    /**
     * 检查验证码是否已过期
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expireTime);
    }

    /**
     * 检查是否超过最大尝试次数
     */
    public boolean isMaxTriesReached(int maxTries) {
        return tryCount >= maxTries;
    }

    /**
     * 增加尝试次数
     */
    public void incrementTryCount() {
        this.tryCount++;
    }
}
