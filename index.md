# 学生信息管理系统
- 技术栈：Java 17, Spring Boot, Spring Data JPA, MySQL, Maven, Spring Security + JWT, React + Vite (前端)
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
│  │     └─ application-dev.properties     # 开发配置（通常用于 H2）
└─ target/                       # Maven 构建输出
```

说明：上面列出的文件/目录为常见条目；项目中可能还有更多细分包（如 jwt、web、config 等）。

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







