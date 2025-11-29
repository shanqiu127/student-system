# 学生管理系统 - 前端项目

## 🎨 UI 设计说明

### 登录页面
- **设计风格**：玻璃态深色背景 + 氛围光效
- **配色方案**：深紫黑色背景，青蓝色强调色 (#00f2ff)
- **交互效果**：输入框焦点动效、按钮悬停效果、背景漂浮动画
- **功能**：用户名/密码登录，记住我选项（UI已实现，功能待扩展）

### 学生管理页面
- **设计风格**：深色顶部导航栏 + 白色内容区
- **顶部导航**：系统Logo、标题、用户菜单（包含退出登录）
- **工具栏**：搜索框、下载模板、一键导入学生
- **表格展示**：学号、姓名、性别、班级、监护人手机号、状态、操作
- **分页控件**：总数显示、每页条数选择、上下页切换、跳转功能

## 📦 技术栈

- **框架**：React 18.2
- **路由**：React Router DOM 6.14
- **HTTP 客户端**：Axios 1.5
- **图标库**：Lucide React 0.292
- **通知组件**：React Hot Toast 2.4
- **构建工具**：Vite 5.0

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式运行
```bash
npm run dev
```
前端默认运行在：`http://localhost:5173`

### 生产构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 🔧 配置说明

### 后端 API 地址配置
默认后端地址：`http://localhost:8080`

如需修改，可在 `src/services/api.js` 中调整，或设置环境变量：
```bash
VITE_API_BASE_URL=http://your-backend-url
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   └── StudentForm.jsx  # 学生表单（新建/编辑）
├── layouts/             # 布局组件
│   └── MainLayout.jsx   # 主布局（路由守卫）
├── pages/               # 页面组件
│   ├── Login.jsx        # 登录页
│   ├── Students.jsx     # 学生管理页
│   ├── Dashboard.jsx    # 仪表盘（待办事项）
│   └── *Placeholder.jsx # 其他模块占位页
├── services/            # API 服务
│   └── api.js           # Axios 配置与拦截器
├── utils/               # 工具函数
│   ├── auth.js          # Token 存储与获取
│   └── errorHandler.js  # 错误处理工具
├── main.jsx             # 应用入口
└── styles.css           # 全局样式
```

## 🔐 认证机制

### JWT Token 流程
1. 用户登录成功后，后端返回 JWT token
2. Token 存储在 localStorage 中
3. 后续所有 API 请求自动在 Header 中携带：`Authorization: Bearer {token}`
4. Token 过期或无效时，自动清除并跳转登录页

### 路由守卫
- `/login` - 公开访问
- `/app/*` - 需要登录认证
- 未登录访问受保护路由时，自动重定向到登录页

## 🎯 核心功能

### 学生管理
- ✅ 分页查询学生列表
- ✅ 按学号搜索学生
- ✅ 新建学生信息
- ✅ 编辑学生信息
- ✅ 删除学生
- ✅ Excel 批量导入学生
- ✅ 下载导入模板

### 待办事项（Dashboard）
- ✅ 查看待办列表
- ✅ 新增待办
- ✅ 切换完成状态
- ✅ 删除待办

## 🎨 样式规范

### 颜色变量
- **主色调**：`#409EFF` (蓝色)
- **成功色**：`#67C23A` (绿色)
- **危险色**：`#F56C6C` (红色)
- **文字色**：`#606266` (深灰)
- **边框色**：`#dcdfe6` (浅灰)
- **背景色**：`#f5f7fa` (极浅灰)

### 登录页特殊颜色
- **强调色**：`#00f2ff` (青蓝)
- **渐变背景**：`radial-gradient(circle, #1a103c 0%, #000000 100%)`

## 📝 开发注意事项

1. **表单验证**：前端已实现基础验证，与后端验证规则保持一致
2. **错误处理**：统一使用 `toast` 显示错误信息
3. **Loading 状态**：所有异步操作都应显示加载状态
4. **响应式设计**：页面已适配桌面端，移动端适配待优化

## 🔗 与后端对接

详细接口文档请参考项目根目录的 `API文档.md`

### 主要接口
- `POST /api/auth/login` - 用户登录
- `GET /api/students` - 获取学生列表（支持分页和搜索）
- `POST /api/students` - 创建学生
- `PUT /api/students/{id}` - 更新学生
- `DELETE /api/students/{id}` - 删除学生
- `POST /api/students/import` - 导入学生
- `GET /api/students/template` - 下载模板

## 🐛 已知问题

- [ ] 点击用户菜单外部区域未自动关闭（待优化）
- [ ] "忘记密码"功能未实现
- [ ] "跳转到指定页"功能未绑定事件

## 📄 许可

本项目仅供学习交流使用
