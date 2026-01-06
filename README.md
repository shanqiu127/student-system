# 🎓 学生信息管理系统 (Student Information System)

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

一个基于 **Spring Boot + React** 的现代化前后端分离学生管理系统


</div>

---

## 📖 项目简介

这是一个完整的前后端分离学生管理系统，采用现代化的技术栈和架构设计，实现了用户认证、学生信息管理、数据隔离、角色权限控制等核心功能。项目适合作为学习 Spring Boot + React 全栈开发的实战案例。

---

## 🎯 功能特性

### 核心功能

#### 👤 用户认证
- ✅ JWT Token 认证机制
- ✅ 用户注册（邮箱验证码 + 图形验证码）
- ✅ 角色判断与智能路由跳转
- ✅ 密码 BCrypt 加密存储
- ✅ 防刷机制（失败锁定）

#### 📚 学生管理
- ✅ 学生信息 CRUD 操作
- ✅ 分页查询与按学号搜索
- ✅ Excel 批量导入
- ✅ 用户独立数据
- ✅ 学号唯一性校验

#### 🔐 权限控制
- ✅ 基于角色的访问控制
- ✅ 管理员控制台
- ✅ 普通用户工作区
- ✅ API 接口权限拦截

#### 📝 待办事项
- ✅ 个人 Todo 管理
- ✅ 状态切换与删除
- ✅ 简洁直观的界面

---

---


## 🚀 快速开始

### 环境要求

- ☕ **JDK**: 17+
- 🔧 **Maven**: 3.6+
- 🗄️ **MySQL**: 8.0+（生产环境）
- 📦 **Node.js**: 16+
- 🎨 **npm**: 8+

### 1克隆项目

```bash
git clone https://github.com/shanqiu127/student-system.git
cd student-system
```

### 2 创建配置文件
### 📌 application-dev.properties（测试环境）

**适用场景**：快速体验、开发测试

**关键配置项**：
```properties
# 服务端口
server.port=8081

# H2 内存数据库（无需配置）
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=

# H2 控制台（可选）
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA 配置
spring.jpa.hibernate.ddl-auto=create-drop  # 每次启动重建表
spring.jpa.show-sql=true

# JWT 配置（与生产环境相同）
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000

# 邮件配置
spring.mail.host=smtp.qq.com
spring.mail.port=465
spring.mail.username=your_email@qq.com
spring.mail.password=your_auth_code

```
### 📌 application.properties（生产环境）

**适用场景**：正式部署、数据持久化

**关键配置项**：
```properties
# 服务端口
server.port=8080

# MySQL 数据库配置（需修改为你的实际配置）
spring.datasource.url=jdbc:mysql://localhost:3306/sis_db?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password

# JPA 配置
spring.jpa.hibernate.ddl-auto=update    # 自动更新表结构
spring.jpa.show-sql=true                # 显示 SQL 语句

# JWT 配置
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000             # Token 有效期 24 小时

# 邮件配置（QQ 邮箱）
spring.mail.qq.host=smtp.qq.com
spring.mail.qq.port=465
spring.mail.qq.username=your_email@qq.com
spring.mail.qq.password=your_qq_auth_code

# 邮件配置（网易邮箱）
spring.mail.netease.host=smtp.163.com
spring.mail.netease.port=465
spring.mail.netease.username=your_email@163.com
spring.mail.netease.password=your_netease_auth_code
```

```
### 3 后端启动

#### 方式一：使用 H2 测试环境（推荐新手）
```
```bash
# 无需配置数据库，直接运行
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

#### 方式二：使用 MySQL 生产环境

**创建数据库**
```sql
CREATE DATABASE sis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
mvn spring-boot:run
```

### 4 前端启动

```bash
cd student-system\frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4️⃣ 访问系统

#### 测试环境默认账户

系统启动后会自动创建管理员账户：
- **用户名**：`admin`
- **密码**：`admin123`
- **角色**：ROLE_ADMIN

#### 访问地址

- 🌐 前端界面：http://localhost:3000

---



---

### 🔑 邮件服务配置指南

#### QQ 邮箱获取授权码
1. 登录 QQ 邮箱 → 设置 → 账户
2. 开启 POP3/SMTP 服务
3. 生成授权码（非登录密码）
4. 将授权码填入配置文件的 `spring.mail.qq.password`

#### 网易邮箱获取授权码
1. 登录网易邮箱 → 设置 → POP3/SMTP/IMAP
2. 开启 SMTP 服务
3. 获取授权码
4. 将授权码填入配置文件的 `spring.mail.netease.password`

---

### ⚠️ 配置注意事项

1. **数据库密码**：生产环境需修改 `application.properties` 中的数据库密码
2. **邮件配置**：注册功能需要邮箱验证码，必须配置邮件服务
3. **JWT Secret**：生产环境建议更换为随机生成的复杂密钥
4. **H2 数据**：测试环境数据在内存中，重启后会清空

---
## 📁 项目结构

```
student-system/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── pages/              # 页面组件（Login、Register、Students 等）
│   │   ├── components/         # 可复用组件
│   │   ├── services/           # API 服务封装
│   │   ├── utils/              # 工具函数（auth、captcha 等）
│   │   └── main.jsx            # 应用入口
│   ├── package.json
│   └── vite.config.js
├── src/main/java/com/example/studentsystem/
│   ├── controller/             # REST 控制器
│   ├── service/                # 业务逻辑层
│   ├── repository/             # 数据访问层
│   ├── model/                  # 实体类
│   ├── dto/                    # 数据传输对象
│   ├── security/               # 安全相关（JWT、过滤器）
│   ├── exception/              # 异常处理
│   └── StudentSystemApplication.java  # 应用入口
├── src/main/resources/
│   ├── application.properties          # MySQL 生产配置
│   └── application-dev.properties      # H2 测试配置
├── pom.xml                     # Maven 配置
└── target/                     # 构建输出
```

---
--

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐ 支持一下吧！

---

<div align="center">

**Made with ❤️ by [liang]**

[⬆ 回到顶部](#-学生信息管理系统-student-information-system)

</div>

