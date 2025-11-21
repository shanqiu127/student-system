package com.example.studentsystem.model;
/**
 * 枚举：表示系统中的角色/权限
 * 常用于存入实体、数据库（以字符串形式存储）以及在 Spring Security 中转换为 GrantedAuthority。
 * 命名约定：使用 "ROLE_" 前缀便于与 Spring Security 的权限检查（例如 hasRole("ADMIN") / hasAuthority("ROLE_ADMIN")）配合。
 */
public enum Role {
    // 普通用户角色
    ROLE_USER,
    // 管理员角色
    ROLE_ADMIN
}
