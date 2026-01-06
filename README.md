# 🎓 学生信息管理系统

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**一个基于 Spring Boot + React 的现代化前后端分离学生管理系统**

</div>

## 📖 项目简介

这是一个完整的前后端分离学生管理系统，采用现代化的技术栈和架构设计，实现了用户认证、学生信息管理、数据隔离、角色权限控制等核心功能。项目适合作为学习 Spring Boot + React 全栈开发的实战案例。

## 🎯 功能特性

### 👤 用户认证
- JWT Token 认证机制
- 用户注册（邮箱验证码 + 图形验证码）
- 角色判断与智能路由跳转
- 密码 BCrypt 加密存储
- 防刷机制（失败锁定）

### 📚 学生管理
- 学生信息 CRUD 操作
- 分页查询与按学号搜索
- Excel 批量导入
- 用户独立数据
- 学号唯一性校验

### 🔐 权限控制
- 基于角色的访问控制
- 管理员控制台
- 普通用户工作区
- API 接口权限拦截

### 📝 待办事项
- 个人 Todo 管理
- 状态切换与删除
- 简洁直观的界面

## 🛠 技术栈

### 后端
- **框架**：Spring Boot 3.5.7
- **语言**：Java 17
- **数据库**：MySQL 8.0+ / H2（测试环境）
- **ORM**：Spring Data JPA
- **安全**：Spring Security + JWT
- **构建工具**：Maven

### 前端
- **框架**：React 18.2
- **构建工具**：Vite
- **UI 库**：Tailwind CSS
- **HTTP 客户端**：Axios

## 🚀 快速开始

### 环境要求

| 依赖 | 版本 |
|------|------|
| JDK | 17+ |
| Maven | 3.6+ |
| MySQL | 8.0+（生产环境） |
| Node.js | 16+ |
| npm | 8+ |

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/shanqiu127/student-system.git
cd student-system
```

#### 2. 创建配置文件

**测试环境（推荐新手）**：使用 `application-dev.properties`

```properties
# 服务端口
server.port=8081

# H2 内存数据库
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=

# H2 控制台
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA 配置
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# JWT 配置
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000

# 邮件配置
spring.mail.host=smtp.qq.com
spring.mail.port=465
spring.mail.username=your_email@qq.com
spring.mail.password=your_auth_code
```

**生产环境**：使用 `application.properties`

```properties
# 服务端口
server.port=8080

# MySQL 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/sis_db?useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT 配置
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000

# QQ 邮件配置
spring.mail.qq.host=smtp.qq.com
spring.mail.qq.port=465
spring.mail.qq.username=your_email@qq.com
spring.mail.qq.password=your_qq_auth_code

# 网易邮件配置
spring.mail.netease.host=smtp.163.com
spring.mail.netease.port=465
spring.mail.netease.username=your_email@163.com
spring.mail.netease.password=your_netease_auth_code
```

#### 3. 启动后端

**方式一：H2 测试环境（推荐新手）**

```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

**方式二：MySQL 生产环境**

先创建数据库：

```sql
CREATE DATABASE sis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后启动：

```bash
mvn spring-boot:run
```

#### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 访问系统

- 前端地址：http://localhost:3000
- 默认管理员：`admin` / `admin123`

## 📂 项目结构

```
student-system/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   ├── components/         # 可复用组件
│   │   ├── services/           # API 服务
│   │   ├── utils/              # 工具函数
│   │   └── main.jsx            # 应用入口
│   ├── package.json
│   └── vite.config.js
├── src/main/java/com/example/studentsystem/
│   ├── controller/             # REST 控制器
│   ├── service/                # 业务逻辑层
│   ├── repository/             # 数据访问层
│   ├── model/                  # 实体类
│   ├── dto/                    # 数据传输对象
│   ├── security/               # 安全相关
│   ├── exception/              # 异常处理
│   └── StudentSystemApplication.java
├── src/main/resources/
│   ├── application.properties          # 生产配置
│   └── application-dev.properties      # 测试配置
└── pom.xml
```

## ⚙️ 配置说明

### 邮件服务配置

**QQ 邮箱**
1. 登录 QQ 邮箱 → 设置 → 账户
2. 开启 POP3/SMTP 服务
3. 生成授权码
4. 将授权码填入 `spring.mail.qq.password`

**网易邮箱**
1. 登录网易邮箱 → 设置 → POP3/SMTP/IMAP
2. 开启 SMTP 服务
3. 获取授权码
4. 将授权码填入 `spring.mail.netease.password`

### 注意事项

| 项目 | 说明 |
|------|------|
| 数据库密码 | 生产环境需修改 `application.properties` 中的数据库密码 |
| 邮件配置 | 注册功能需要邮箱验证码，必须配置邮件服务 |
| JWT Secret | 生产环境建议更换为随机生成的复杂密钥 |
| H2 数据 | 测试环境数据在内存中，重启后会清空 |

---

<div align="center">

**Made with ❤️ by [liang]**

如果这个项目对你有帮助，请给个 Star ⭐ 支持一下吧！

[⬆ 回到顶部](#-学生信息管理系统)

</div>
