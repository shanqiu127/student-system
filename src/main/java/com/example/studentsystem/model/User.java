package com.example.studentsystem.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 用户实体并实现 Spring Security 的 UserDetails 接口。
 * - 使用 @ElementCollection 存储角色集合（枚举以字符串形式存储）。
 * - getAuthorities() 将枚举转换为 SimpleGrantedAuthority 供 Spring Security 使用。
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 数据库@ID设为主键，@GeneratedValu自增

    @Column(unique = true, nullable = false)
    private String username; // 登录名，唯一且不可为空

    @Column(nullable = false)
    private String password; // 已加密的密码

    /**
     * 角色集合：
     * - FetchTypeEAGER：每次加载用户时一并加载角色。
     * - @CollectionTable(name = "user_roles")：枚举集合将映射到独立表 user_roles。
     * - @Enumerated(EnumType.STRING)：以枚举名字符串存储 （如 "ROLE_ADMIN"）。
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles")
    @Enumerated(EnumType.STRING)
    // 使用 Set 避免重复角色,将实体中的角色授予roles权限
    private Set<Role> roles = new HashSet<>();

    // 无参构造（JPA 需要）
    public User() {}

    // 构造器：创建用户时可传入初始角色集合
    public User(String username, String password, Set<Role> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    /**
     * 将roles集合返回可识别的 GrantedAuthority 列表。
     * GrantedAuthority 列表包含用户的权限信息
     * 这里使用枚举的 name() 作为权限字符串（例如 "ROLE_ADMIN"）。
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority(r.name()))
                .collect(Collectors.toList());
    }
    // 实现 UserDetails 接口的其他方法
    @Override public String getPassword(){ return password; }
    @Override public String getUsername(){ return username; }
    @Override public boolean isAccountNonExpired(){ return true; } // 可根据需要改为字段驱动
    @Override public boolean isAccountNonLocked(){ return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled(){ return true; }

    public void setUsername(String username){ this.username = username; }
    public void setPassword(String password){ this.password = password; }
    public Set<Role> getRoles(){ return roles; }
    public void setRoles(Set<Role> roles){ this.roles = roles; }
}