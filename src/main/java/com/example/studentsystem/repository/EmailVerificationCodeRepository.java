package com.example.studentsystem.repository;

import com.example.studentsystem.model.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 邮箱验证码数据访问层
 */
@Repository
public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {

    /**
     * 根据邮箱和场景查找最新的验证码记录
     */
    Optional<EmailVerificationCode> findFirstByEmailAndSceneOrderByCreatedTimeDesc(String email, String scene);

    /**
     * 根据邮箱、场景和状态查找验证码记录
     */
    Optional<EmailVerificationCode> findByEmailAndSceneAndStatus(String email, String scene, Integer status);

    /**
     * 统计某个邮箱在指定时间之后的发送次数
     */
    long countByEmailAndSceneAndCreatedTimeAfter(String email, String scene, LocalDateTime after);
}
