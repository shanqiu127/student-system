```markdown
# Student System - Frontend (React + Vite)

- 前端使用 React 和 Vite 构建，提供与后端 API 交互的用户界面。
- 支持用户登录、查看学生列表、创建学生等功能。
-


1. 前端的本地运行（默认会以 Vite 端口 3000 启动）：
   # 指定后端 base URL（默认 http://localhost:8081）
   在powlershell中运行：
   Set-Location 'D:\student-system\frontend'
   $env:VITE_API_BASE_URL="http://localhost:8081"; npm run dev

   或测试另一个前端端口（例如 8080）：
   $env:VITE_API_BASE_URL="http://localhost:8080"; npm run dev

2. 打开浏览器：
   http://localhost:3000

使用说明：
- 登录：访问 /login。后端 /api/auth/login 返回的 token 会被保存到 localStorage。
- 切换后端：修改 VITE_API_BASE_URL 环境变量（或在 .env 文件里设置 VITE_API_BASE_URL）。
- 注意：创建学生通常需要 ADMIN 权限（使用管理员 token，例如 admin/admin123），否则会收到 403。

CORS
- 若前端和后端端口不同，后端必须允许前端 origin 并允许 Authorization header。后端 Spring Boot 应配置允许跨域或全局 CORS。
```