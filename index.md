# 学生信息管理系统
- 后端：Spring Boot（Java）
  入口：src/main/java/com/example/studentsystem/StudentSystemApplication.java。
  依赖与构建：Maven，pom.xml 管理依赖与插件。
  常见分层：controller/、service/、repository/、model/、dto/、mapper/、exception/、security/（见 src/main/java/... 目录）。
  配置：src/main/resources/application.properties 与 application-dev.properties 控制环境配置。
  异常处理：项目使用 @RestControllerAdvice 类（如 exception 包下的 GlobalExceptionHandler / ErrorResponse）统一返回 JSON 给前端（无需前端直接引用）。
  持久层：Spring Data JPA（repository 层）或类似 ORM（通过 repository 包和实体 model 可见），数据库连接由 application*.properties 配置。
  安全：存在 security/ 包，通常使用 Spring Security（鉴权/会话/JWT 等在该包实现）。
  前端：React + Vite（现代前端）
  源码：frontend/src/，入口 frontend/src/main.jsx。
  页面与组件：frontend/src/pages/、frontend/src/components/（例：StudentForm.jsx）。
  服务层：frontend/src/services/api.js 封装 fetch/axios 请求与后端 ErrorResponse 的统一处理。
  工具：frontend/src/utils/auth.js 用于前端鉴权逻辑。
  构建工具与脚本：frontend/package.json、vite.config.js（开发 npm install + npm run dev，生产构建 npm run build）。
  打包与产物：后端打包为可执行 JAR，生成在 target/（如 student-system-0.0.1-SNAPSHOT.jar）。
  测试：JUnit 测试类位于 test/，构建报告在 target/surefire-reports/。
  常见数据交互与错误处理流程：前端通过 REST 调用后端 API（/api/...），后端返回 HTTP 状态码与 JSON（统一 ErrorResponse），前端在 api.js 中拦截并展示错误或表单字段错误。
  简短总结：这是一个典型的 Java Spring Boot + React（Vite）全栈项目，Maven 管理后端依赖与构建，前端使用 Vite + React 进行开发与打包，后端负责 REST API、数据持久化与安全
## 项目概览

根目录结构（简要）：

```
student-system/
├─ .gitignore
├─ pom.xml
├─ mvnw
├─ frontend/                     # 前端 React + Vite 项目
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ main.jsx
│     ├─ styles.css
│     ├─ components/
│     │  └─ StudentForm.jsx
│     ├─ pages/
│     │  ├─ Login.jsx
│     │  └─ Students.jsx
│     ├─ services/
│     │  └─ api.js                # axios 实例，配置后端 baseURL
│     └─ utils/
│        └─ auth.js               # token 存取等工具
├─ src/                          # 后端 Java 源码
│  ├─ main/
│  │  ├─ java/com/example/studentsystem/
│  │  │  ├─ StudentSystemApplication.java
│  │  │  ├─ controller/
│  │  │  ├─ dto/
│  │  │  ├─ exception/
│  │  │  ├─ mapper/
│  │  │  ├─ model/
│  │  │  ├─ repository/
│  │  │  ├─ security/
│  │  │  └─ service/
│  │  └─ resources/
│  │     ├─ application.properties         # 生产/默认配置
│  │     └─ application-dev.properties     # 开发配置（用于 H2）
└─ target/                       # Maven 构建输出
```
---

## 前端（Frontend）说明

- 技术：React + Vite
- 入口：`frontend/src/main.jsx`
- 与后端交互的地方：`frontend/src/services/api.js`，其会从环境变量读取后端 baseURL（Vite 环境变量名为 `VITE_API_BASE_URL`）。
- 开发运行（在 PowerShell 中）：

```powershell
Set-Location 'D:\student-system\frontend'
$env:VITE_API_BASE_URL="http://localhost:8081"; npm run dev
# 或808端口：
$env:VITE_API_BASE_URL="http://localhost:8080"; npm run dev
```

- Vite dev server 默认端口通常为 3000，打开浏览器访问 http://localhost:3000
## 后端（Backend）运行说明

项目支持两种常见的本地运行配置：在开发时使用内存 H2 数据库（方便快速调试），或连接本地 MySQL（用于更真实的数据持久化）。下面给出常用命令示例。

1) 在 WSL  下使用 H2（端口 8081）：

```bash
# 在 WSL/bash 中（H2，内存数据库，适合快速调试）
java -jar target/student-system-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:h2:mem:testdb \
  --spring.datasource.driver-class-name=org.h2.Driver \
  --spring.datasource.username=sa \
  --spring.datasource.password= \
  --spring.jpa.hibernate.ddl-auto=update \
  --spring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
  --spring.h2.console.enabled=true \
  --spring.h2.console.path=/h2-console \
  --server.port=8081
```

2) 在 PowerShell 中使用本地 MySQL（端口 8080）

```powershell
Set-Location 'D:\student-system'
java -jar target\student-system-0.0.1-SNAPSHOT.jar \
```







