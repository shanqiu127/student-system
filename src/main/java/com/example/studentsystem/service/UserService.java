package com.example.studentsystem.service;

import com.example.studentsystem.model.Role;
import com.example.studentsystem.model.User;
import com.example.studentsystem.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * UserService
 * 职责集中：
 * 1. 封装用户相关的核心业务（注册、查询、管理员初始化）。
 * 2. 作为桥梁：连接控制层（例如注册接口）、安全层（认证时加载用户）与持久化层（UserRepository）。
 * 与其他类的协作：
 * - Role：定义角色枚举（ROLE_USER / ROLE_ADMIN），本服务在创建用户时赋值；在实体 User 中被转换为 GrantedAuthority。
 * - User：JPA 实体并实现 UserDetails，供 Spring Security 使用；本服务创建与返回该对象。
 * - UserRepository：JPA 数据访问接口，提供按用户名查找与保存；本服务调用其 CRUD 方法。
 * 设计与安全：
 * - 密码统一使用 PasswordEncoder 加密后保存，避免明文存储（防暴力破解与泄露风险）。
 * - 注册时先检查重复用户名，抛出业务异常防止覆盖已有账户。
 * - 通过 ensureAdminExists 提供系统启动自检/初始化入口，防止无管理员无法管理系统。
 * - loadUserByUsername 把 UsernameNotFoundException 抛出给 Spring Security，用于认证失败分支。
 */
@Service
public class UserService {

    // 依赖注入：仓库用于持久化操作，PasswordEncoder 用于安全加密密码
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 构造注入：
     * - 保证依赖的不可变性（final）。
     * - PasswordEncoder 由安全配置中定义。
     */
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * register
     * 功能：注册一个新用户并赋予默认普通角色 ROLE_USER。
     * 流程：
     * 1. 调用仓库按用户名查询，若已存在抛出 IllegalArgumentException（业务层面冲突）。
     * 2. 构造 User 实例，使用 PasswordEncoder 对原始密码加密。
     * 3. 设置初始角色集合：Set.of(Role.ROLE_USER)，与 User.roles 映射到 user_roles 表。
     * 4. 保存并返回持久化后的实体（含生成的 id）。
     * 安全点：
     * - passwordEncoder.encode 防止明文入库。
     * - 角色集合使用 Set 避免重复角色。
     * @param username 新用户名（需唯一）
     * @param rawPassword 原始输入密码（未加密）
     * @return 持久化后的用户对象
     * @throws IllegalArgumentException 若用户名已存在
     */
    public User register(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("用户名已存在");
        }
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(rawPassword)); // 密码加密
        u.setRoles(Set.of(Role.ROLE_USER)); // 默认授予普通用户角色
        return userRepository.save(u);
    }

    /**
     * loadUserByUsername
     * 功能：按用户名加载用户，用于认证流程。
     * 关联：
     * - 返回的 User 实现了 UserDetails，其 getAuthorities() 会把 roles 转换为 SimpleGrantedAuthority。
     * - 若找不到则抛出 UsernameNotFoundException，Spring Security 将据此判定认证失败。
     *
     * @param username 目标用户名
     * @return 匹配的 User 实体（UserDetails）
     * @throws UsernameNotFoundException 若不存在该用户
     */
    public User loadUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
    }

    /**
     * ensureAdminExists
     * 功能：在系统启动或某初始化逻辑中调用，确保至少有一个管理员账户存在。
     * 场景：
     * - 可在应用启动监听器或配置类中调用，用于自动创建初始管理员。
     * - 防止部署后没有管理入口。
     * 流程：
     * 1. 先按 adminUser 查询是否存在。
     * 2. 若不存在，创建新 User，密码加密，授予角色集合 Set.of(Role.ROLE_ADMIN)。
     * 3. 保存到数据库。
     * 安全点：
     * - 与普通注册一样使用 PasswordEncoder。
     * - 仅在不存在时创建，避免覆盖已有管理员密码。
     *
     * @param adminUser 管理员用户名
     * @param adminPass 原始管理员密码
     */
    public void ensureAdminExists(String adminUser, String adminPass) {
        if (userRepository.findByUsername(adminUser).isEmpty()) {
            User admin = new User(adminUser, passwordEncoder.encode(adminPass), Set.of(Role.ROLE_ADMIN));
            userRepository.save(admin);
        }
    }
}
