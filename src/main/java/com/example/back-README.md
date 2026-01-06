# 学生管理系统 - 后端项目

## 📋 项目简介

基于 Spring Boot 3.5.7 开发的学生信息管理系统后端，采用前后端分离架构，提供 RESTful API 接口。

**核心功能**：
- 用户认证与授权（JWT + Spring Security）
- 学生信息管理（CRUD + Excel 导入导出）
- 数据隔离（每个用户独立管理自己的学生数据）
- 角色权限控制（管理员/普通用户）
- 邮箱验证（注册时邮箱验证码）
- 待办事项管理

## 🛠️ 技术栈

### 核心框架
- **Spring Boot**: 3.5.7
- **Spring Data JPA**: 数据持久化
- **Spring Security**: 安全框架
- **Spring Boot Mail**: 邮件发送

### 数据库
- **生产环境**: MySQL 8.0（数据库名：`sis_db`）
- **测试环境**: H2 Database（内存数据库）

### 工具库
- **Lombok**: 简化实体类代码
- **JWT (JJWT)**: 0.11.5，用于生成和验证 JWT Token
- **Apache POI**: 5.2.5，Excel 文件解析
- **Validation**: 参数校验

### 构建工具
- **Maven**: 依赖管理和项目构建
- **Java**: 17

## 📁 项目结构

```
src/main/java/com/example/studentsystem/
├── config/                    # 配置类
│   └── SecurityConfig.java    # Spring Security 配置
├── controller/                # 控制器层（返回 ResponseEntity）
│   ├── StudentController.java # 学生管理接口
│   ├── TodoController.java    # 待办事项接口
│   └── AdminController.java   # 管理员接口
├── web/                       # Web 层（认证相关）
│   ├── AuthController.java    # 登录注册接口
│   └── EmailController.java   # 邮箱验证接口
├── dto/                       # 数据传输对象
│   ├── StudentRequestDto.java # 学生请求 DTO
│   ├── StudentResponseDto.java # 学生响应 DTO
│   └── TodoDto.java           # 待办事项 DTO
├── model/                     # 实体类
│   ├── User.java              # 用户实体
│   ├── Student.java           # 学生实体（多对一关联 User）
│   ├── Todo.java              # 待办事项实体
│   ├── Role.java              # 角色枚举
│   └── EmailVerificationCode.java # 邮箱验证码实体
├── repository/                # 数据访问层
│   ├── UserRepository.java
│   ├── StudentRepository.java
│   ├── TodoRepository.java
│   └── EmailVerificationCodeRepository.java
├── service/                   # 业务逻辑层
│   ├── UserService.java       # 用户服务
│   ├── StudentService.java    # 学生服务（接口）
│   ├── StudentServiceImpl.java # 学生服务实现（数据隔离）
│   ├── TodoService.java       # 待办事项服务
│   └── EmailService.java      # 邮件发送服务
├── security/                  # 安全相关
│   ├── jwt/
│   │   ├── JwtService.java    # JWT 生成与验证（包含角色信息）
│   │   └── JwtAuthFilter.java # JWT 认证过滤器
│   └── UserDetailsServiceImpl.java # 用户详情服务
├── mapper/                    # 对象映射
│   └── StudentMapper.java     # Student 与 DTO 转换
├── exception/                 # 异常处理
│   ├── GlobalExceptionHandler.java # 全局异常处理器
│   ├── DuplicateResourceException.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
└── StudentSystemApplication.java # 应用主入口
```

## 🚀 快速开始

### 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0（生产环境）
- Node.js 16+（前端开发）

### 数据库配置

#### 1. MySQL 生产环境
创建数据库：
```sql
CREATE DATABASE sis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置文件：`application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sis_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

#### 2. H2 测试环境
配置文件：`application-dev.properties`

### 邮件服务配置

在 `application.properties` 中配置 SMTP 信息：
```properties
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=your_email@qq.com
spring.mail.password=your_authorization_code
```

### 启动应用

#### 生产环境（MySQL）
在 PowerShell 中运行：
```bash
mvn spring-boot:run
```

#### 测试环境（H2）
在 WSL 中运行：
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

应用默认运行在：
- **MySQL 环境**: `http://localhost:8080`
- **H2 环境**: `http://localhost:8081`

## 🔐 认证与授权

### JWT Token 机制
1. 用户登录成功后，返回包含用户名和角色信息的 JWT Token
2. Token 格式：`Bearer {jwt_token}`
3. Token 包含的信息：
   - 用户名（subject）
   - 角色列表（roles）
   - 签发时间（iat）
   - 过期时间（exp，默认 24 小时）

### 角色权限
- **ROLE_USER**: 普通用户，可管理自己的学生数据和待办事项
- **ROLE_ADMIN**: 管理员，可查看系统统计信息，访问管理控制台

### 管理员账户

**测试环境（H2）**：系统启动时自动创建默认管理员账户（仅在无 ROLE_ADMIN 用户时创建）：
- 用户名：`admin`
- 密码：`admin123`

**生产环境（MySQL）**：已禁用自动创建功能（`app.init.enabled=false`），请通过以下方式创建管理员：

**方法：直接在数据库创建**
```sql
-- 例如：
-- 1. 插入管理员用户（密码为 BCrypt 加密后的 'admin123'）
INSERT INTO users (username, password, email) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z2EHCx7P6vMNJ6/IXUKwdnQ2', 'admin@example.com');

-- 2. 获取刚创建的用户ID
SELECT id FROM users WHERE username = 'admin';

-- 3. 为该用户添加 ROLE_ADMIN 角色（假设用户ID为1）
INSERT INTO user_roles (user_id, roles) 
VALUES (1, 'ROLE_ADMIN');
```
**注意**：上述 password 字段为 `admin123` 的 BCrypt 加密结果。


## 📊 核心功能

### 1. 用户认证
- ✅ 用户注册（邮箱验证 + 密码加密）
- ✅ 用户登录（返回包含角色的 JWT）
- ✅ 邮箱验证码发送（60秒倒计时，5分钟有效期）
- ✅ 邮箱验证码验证
- ⏳ 重置密码（待实现）

### 2. 学生管理
- ✅ 分页查询学生列表（按用户隔离）
- ✅ 按学号搜索学生
- ✅ 新增学生（学号在同一用户下唯一）
- ✅ 更新学生信息
- ✅ 删除学生
- ✅ Excel 批量导入学生
- ✅ 下载 Excel 导入模板
- ✅ 数据隔离（每个用户只能管理自己的学生）

### 3. 待办事项
- ✅ 查询待办列表
- ✅ 创建待办
- ✅ 更新待办（包括状态切换）
- ✅ 删除待办

### 4. 管理员功能
- ✅ 系统统计数据（用户数、学生数等）
- ✅ 最新注册用户列表
- ✅ 角色统计

## 🔑 核心实现

### 数据隔离
学生数据通过 `User` 外键实现隔离：
```java
@Entity
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_no", "user_id"})
})
public class Student {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 所属用户
}
```




### JWT 角色信息
JWT Token 中包含角色信息，便于前端进行权限判断：
```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    // 添加角色信息到 claims
    Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
    List<String> roles = authorities.stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());
    claims.put("roles", roles);
    
    return createToken(claims, userDetails.getUsername());
}
```

### 邮箱验证
- 验证码随机生成 6 位数字
- 存储在数据库中，包含邮箱、验证码、使用场景、过期时间
- 验证成功后标记为已使用
- 5 分钟内有效，超时自动失效

### Excel 导入
- 使用 Apache POI 解析 Excel 文件
- 支持批量导入学生数据
- 自动过滤空行和无效数据
- 返回成功导入的学生数量

## 🌐 API 接口

详细接口文档请参考项目根目录的 `API文档.md`

### 主要端点

**认证相关** (`/api/auth`)
- `POST /login` - 用户登录
- `POST /register` - 用户注册
- `POST /email/code/send` - 发送邮箱验证码
- `POST /email/code/verify` - 验证邮箱验证码

**学生管理** (`/api/students`)
- `GET /` - 查询学生列表（分页、搜索）
- `POST /` - 创建学生
- `PUT /{id}` - 更新学生
- `DELETE /{id}` - 删除学生
- `POST /import` - 导入学生
- `GET /template` - 下载模板

**待办事项** (`/api/todos`)
- `GET /` - 查询待办列表
- `POST /` - 创建待办
- `PUT /{id}` - 更新待办
- `DELETE /{id}` - 删除待办

**管理员** (`/api/admin`)
- `GET /stats` - 获取系统统计数据（需要 ROLE_ADMIN）

## 📝 配置说明

### 双配置文件设计
- `application.properties`: 生产环境（MySQL），端口 8080
- `application-dev.properties`: 测试环境（H2），端口 8081


### 关键配置项

```properties
# JWT 配置
jwt.secret=your_secret_key_here
jwt.expiration=86400000  # 24小时（毫秒）

# 管理员自动创建
app.init.enabled=true   # 测试环境：启用
                        # 生产环境：已设为 false（禁用）

# 邮件配置
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=your_email@qq.com
spring.mail.password=your_authorization_code
```

## 🧪 测试

### H2 控制台
测试环境下可访问 H2 数据库控制台：
```
http://localhost:8081/h2-console
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (留空)
```

## 🔒 安全注意事项

1. **生产环境部署前**：
   - 修改 `jwt.secret` 为强密码
   - ✅ 已禁用管理员自动创建（`app.init.enabled=false`）
   - 手动创建管理员账户（见上文「管理员账户」章节）
   - 配置正确的 CORS 策略

2. **密码安全**：
   - 使用 BCrypt 加密存储
   - 注册时验证密码强度（至少 6 位，建议包含字母和数字）

3. **API 安全**：
   - 所有业务接口都需要 JWT 认证
   - 管理员接口使用 `@PreAuthorize("hasRole('ADMIN')")` 保护
   - 学生数据操作自动基于当前用户过滤


## 📄 许可

本项目仅供学习交流使用

---

**联系方式**: 3148338348@qq.com
