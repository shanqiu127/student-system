# 学生信息管理系统

一个基于 **Spring Boot 3.5.7 + React** 的前后端分离学生管理系统，支持用户认证、学生信息管理、数据隔离、角色权限控制等功能。

## 🎯 核心特性

- ✅ **用户认证**：JWT + Spring Security，邮箱验证码注册
- ✅ **学生管理**：CRUD 操作、Excel 导入导出、按学号搜索
- ✅ **数据隔离**：每个用户独立管理自己的学生数据
- ✅ **角色控制**：管理员（ROLE_ADMIN）和普通用户（ROLE_USER）
- ✅ **待办事项**：简单的 Todo 管理功能
- ✅ **管理员控制台**：系统统计数据展示
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

## 快速开始

### 前端启动

```powershell
# 进入前端目录
Set-Location D:\student-system\frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev (8081端口)   # 启动开发服务器
npm run build (8080端口)   # 启动生产服务器
```

前端运行在：`http://localhost:3000`

```
### 后端启动
#### JAR 包运行

**1. 构建项目**
```powershell
mvn clean package -DskipTests
```

**2. 运行 JAR**

生产环境（MySQL）：
```powershell
java -jar target\student-system-0.0.1-SNAPSHOT.jar
```

测试环境（H2）：
```bash
java -jar target/student-system-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=dev
```

### 数据库配置

**MySQL**（需先创建数据库）：
```sql
CREATE DATABASE sis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后在 `application.properties` 中配置连接信息。

**H2**：无需额外配置，自动使用内存数据库。

## 🔑 默认账户

**测试环境（H2）** 启动时会自动创建管理员账户：
- **用户名**：`admin`
- **密码**：`admin123`
- **角色**：ROLE_ADMIN
---

**联系方式**：3148338348@qq.com