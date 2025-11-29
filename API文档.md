# 学生管理系统 - 后端接口文档

## 📋 目录
- [基础信息](#基础信息)
- [认证机制](#认证机制)
- [通用说明](#通用说明)
- [认证接口](#认证接口)
- [学生管理接口](#学生管理接口)
- [待办事项接口](#待办事项接口)
- [错误响应格式](#错误响应格式)

---

## 基础信息

### 服务地址
- **开发环境**: `http://localhost:8080`
- **基础路径**: `/api`

### 技术栈
- Spring Boot 3.5.7
- Spring Security + JWT
- Spring Data JPA
- MySQL / H2 Database

---

## 认证机制

### JWT Token 使用方式

1. **登录获取 Token**：调用 `/api/auth/login` 接口获取 JWT token
2. **携带 Token 访问受保护接口**：在请求头中添加：
   ```
   Authorization: Bearer {token}
   ```
3. **Token 过期**：需要重新登录获取新的 token

### 接口权限说明
- ✅ **公开接口**：`/api/auth/register`、`/api/auth/login`
- 🔒 **需要认证**：所有其他接口（`/api/students/*`、`/api/todos/*`）

---

## 通用说明

### 日期格式
- 使用 ISO 8601 格式：`YYYY-MM-DD`
- 示例：`2025-01-15`

### 时间戳格式
- 使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.SSSZ`
- 示例：`2025-11-27T10:30:00.000Z`

### 分页参数
- `page`：页码，从 0 开始（默认 0）
- `size`：每页数量（默认 20）
- `sort`：排序字段，格式：`字段名,排序方式`
  - 示例：`sort=name,asc` 或 `sort=id,desc`

---

## 认证接口

### 1. 用户注册

**接口**: `POST /api/auth/register`

**权限**: 公开

**请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应**: `200 OK`
```json
(空响应体)
```

**失败响应**: `400 Bad Request`
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "用户名已存在",
  "path": "/api/auth/register"
}
```

---

### 2. 用户登录

**接口**: `POST /api/auth/login`

**权限**: 公开

**请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**失败响应**: `401 Unauthorized`
```json
"用户名或密码错误"
```

**说明**:
- 返回的 token 需要保存在客户端（如 localStorage）
- 后续请求需在 Header 中携带：`Authorization: Bearer {token}`

---

## 学生管理接口

### 1. 获取学生列表（分页）

**接口**: `GET /api/students`

**权限**: 需要认证

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| studentNo | String | 否 | 学号筛选 |
| page | Integer | 否 | 页码，从0开始（默认0） |
| size | Integer | 否 | 每页数量（默认20） |
| sort | String | 否 | 排序规则，如：`name,asc` |

**请求示例**:
```
GET /api/students?studentNo=2025001&page=0&size=10&sort=id,desc
```

**成功响应**: `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "studentNo": "2025001",
      "name": "张三",
      "gender": "男",
      "dob": "2005-06-15",
      "phone": "13800001111",
      "phoneBackup": null,
      "address": "北京市朝阳区",
      "className": "高一1班"
    },
    {
      "id": 2,
      "studentNo": "2025002",
      "name": "李四",
      "gender": "女",
      "dob": "2005-08-20",
      "phone": "13800002222",
      "phoneBackup": null,
      "address": null,
      "className": "高一2班"
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "pageNumber": 0
}
```

**字段说明**:
- `content`: 当前页的学生列表
- `totalElements`: 总记录数
- `totalPages`: 总页数
- `pageNumber`: 当前页码

---

### 2. 获取单个学生详情

**接口**: `GET /api/students/{id}`

**权限**: 需要认证

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 学生ID |

**请求示例**:
```
GET /api/students/1
```

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "studentNo": "2025001",
  "name": "张三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
  "phoneBackup": null,
  "address": "北京市朝阳区",
  "className": "高一1班"
}
```

**失败响应**: `404 Not Found`
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found",
  "path": "/api/students/999"
}
```

---

### 3. 创建学生

**接口**: `POST /api/students`

**权限**: 需要认证

**请求体**:
```json
{
  "studentNo": "2025001",
  "name": "张三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
  "phoneBackup": "13800001112",
  "address": "北京市朝阳区",
  "className": "高一1班"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|------|------|------|----------|------|
| studentNo | String | ✅ | 不能为空，最大50字符 | 学号 |
| name | String | ✅ | 不能为空，最大100字符 | 姓名 |
| gender | String | ❌ | - | 性别 |
| dob | String | ❌ | 必须是过去的日期，格式：YYYY-MM-DD | 出生日期 |
| phone | String | ❌ | 以1开头的11位数字 | 监护人手机号 |
| phoneBackup | String | ❌ | - | 备用电话 |
| address | String | ❌ | - | 地址 |
| className | String | ❌ | 最大100字符 | 班级名称 |

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "studentNo": "2025001",
  "name": "张三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
  "phoneBackup": "13800001112",
  "address": "北京市朝阳区",
  "className": "高一1班"
}
```

**失败响应**: `400 Bad Request` (验证失败)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/students",
  "errors": [
    "studentNo: 学号不能为空",
    "phone: 监护人手机号必须是以1开头的11位数字"
  ]
}
```

**失败响应**: `409 Conflict` (学号重复)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 409,
  "error": "Conflict",
  "message": "学号已存在",
  "path": "/api/students"
}
```

---

### 4. 更新学生信息

**接口**: `PUT /api/students/{id}`

**权限**: 需要认证

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 学生ID |

**请求体**: 同创建学生接口

**请求示例**:
```
PUT /api/students/1
```
```json
{
  "studentNo": "2025001",
  "name": "张三三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
  "phoneBackup": null,
  "address": "北京市朝阳区xxx街道",
  "className": "高一3班"
}
```

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "studentNo": "2025001",
  "name": "张三三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
  "phoneBackup": null,
  "address": "北京市朝阳区xxx街道",
  "className": "高一3班"
}
```

**失败响应**: `404 Not Found` (学生不存在)

---

### 5. 删除学生

**接口**: `DELETE /api/students/{id}`

**权限**: 需要认证

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 学生ID |

**请求示例**:
```
DELETE /api/students/1
```

**成功响应**: `204 No Content`
```
(空响应体)
```

**失败响应**: `404 Not Found`

---

### 6. 批量导入学生（Excel）

**接口**: `POST /api/students/import`

**权限**: 需要认证

**请求类型**: `multipart/form-data`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | Excel文件（.xlsx格式） |

**Excel 格式说明**:
| 列序号 | 列名 | 必填 | 说明 |
|--------|------|------|------|
| 第1列 | 姓名 | ❌ | 学生姓名 |
| 第2列 | 学号 | ✅ | 学号（必填，用于唯一标识） |
| 第3列 | 班级 | ❌ | 班级名称 |
| 第4列 | 监护人手机号 | ❌ | 11位手机号 |

**请求示例** (使用 FormData):
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/students/import', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

**成功响应**: `200 OK`
```json
"成功导入 50 条学生记录"
```

**失败响应**: `400 Bad Request`
```json
"文件不能为空"
```
或
```json
"导入失败: Invalid file format"
```

---

### 7. 下载导入模板

**接口**: `GET /api/students/template`

**权限**: 需要认证

**请求示例**:
```
GET /api/students/template
```

**成功响应**: `200 OK`
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename=student-import-template.xlsx`
- **响应体**: Excel 文件二进制流

**模板内容**:
| 姓名 | 学号 | 班级 | 监护人手机号 |
|------|------|------|-------------|
| 张三 | 2025001 | 高一1班 | 13800001111 |

**前端下载示例**:
```javascript
fetch('/api/students/template', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student-import-template.xlsx';
  a.click();
});
```

---

## 待办事项接口

### 1. 获取当前用户的待办列表

**接口**: `GET /api/todos`

**权限**: 需要认证

**请求示例**:
```
GET /api/todos
```

**成功响应**: `200 OK`
```json
[
  {
    "id": 1,
    "text": "批改作业",
    "done": false,
    "createdAt": "2025-11-27T10:30:00.000Z"
  },
  {
    "id": 2,
    "text": "准备下周课件",
    "done": true,
    "createdAt": "2025-11-26T15:20:00.000Z"
  }
]
```

**说明**:
- 只返回当前登录用户的待办事项
- 按创建时间排序

---

### 2. 创建待办事项

**接口**: `POST /api/todos`

**权限**: 需要认证

**请求体**:
```json
{
  "text": "批改作业"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | String | ✅ | 待办内容，不能为空 |

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "text": "批改作业",
  "done": false,
  "createdAt": "2025-11-27T10:30:00.000Z"
}
```

**失败响应**: `400 Bad Request`
```json
(空响应体)
```

---

### 3. 删除待办事项

**接口**: `DELETE /api/todos/{id}`

**权限**: 需要认证

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 待办事项ID |

**请求示例**:
```
DELETE /api/todos/1
```

**成功响应**: `204 No Content`
```
(空响应体)
```

**说明**:
- 只能删除当前登录用户的待办事项
- 如果ID不存在或不属于当前用户，仍返回 204

---

### 4. 切换待办状态

**接口**: `PATCH /api/todos/{id}/toggle`

**权限**: 需要认证

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | Long | 待办事项ID |

**请求示例**:
```
PATCH /api/todos/1/toggle
```

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "text": "批改作业",
  "done": true,
  "createdAt": "2025-11-27T10:30:00.000Z"
}
```

**说明**:
- 切换待办事项的完成状态（done: true ↔ false）
- 只能切换当前登录用户的待办事项

---

## 错误响应格式

### 统一错误响应结构

所有错误响应遵循统一格式：

```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "详细错误信息",
  "path": "/api/students",
  "errors": ["字段1: 错误描述", "字段2: 错误描述"]
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| timestamp | String | 错误发生时间 |
| status | Integer | HTTP 状态码 |
| error | String | 错误类型 |
| message | String | 错误消息 |
| path | String | 请求路径 |
| errors | Array | 详细错误列表（可选，仅验证错误时存在） |

---

### 常见 HTTP 状态码

| 状态码 | 说明 | 常见场景 |
|--------|------|----------|
| 200 | 成功 | 请求成功处理 |
| 204 | 无内容 | 删除成功 |
| 400 | 请求错误 | 参数验证失败、JSON格式错误 |
| 401 | 未认证 | 未登录、Token 无效或过期 |
| 403 | 禁止访问 | 无权限访问资源 |
| 404 | 未找到 | 资源不存在 |
| 409 | 冲突 | 数据重复（如学号已存在） |
| 500 | 服务器错误 | 服务器内部错误 |

---

### 常见错误示例

#### 1. 验证失败 (400)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/students",
  "errors": [
    "studentNo: 学号不能为空",
    "name: 姓名不能为空",
    "phone: 监护人手机号必须是以1开头的11位数字"
  ]
}
```

#### 2. JSON 格式错误 (400)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 400,
  "error": "Bad Request",
  "message": "Malformed JSON request: ...",
  "path": "/api/students"
}
```

#### 3. 认证失败 (401)
```json
"用户名或密码错误"
```

#### 4. Token 无效或过期 (401)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/students"
}
```

#### 5. 资源未找到 (404)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found",
  "path": "/api/students/999"
}
```

#### 6. 数据冲突 (409)
```json
{
  "timestamp": "2025-11-27T10:30:00.123",
  "status": 409,
  "error": "Conflict",
  "message": "学号已存在",
  "path": "/api/students"
}
```

---

## 前端对接建议

### 1. 请求拦截器（Axios 示例）

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

// 请求拦截器：添加 Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 过期，跳转登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. API 封装示例

```javascript
// 认证相关
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  register: (username, password) => 
    api.post('/auth/register', { username, password })
};

// 学生管理
export const studentAPI = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadTemplate: () => 
    api.get('/students/template', { responseType: 'blob' })
};

// 待办事项
export const todoAPI = {
  list: () => api.get('/todos'),
  create: (text) => api.post('/todos', { text }),
  delete: (id) => api.delete(`/todos/${id}`),
  toggle: (id) => api.patch(`/todos/${id}/toggle`)
};
```

### 3. 使用示例

```javascript
// 登录
const handleLogin = async () => {
  try {
    const { token } = await authAPI.login('admin', '123456');
    localStorage.setItem('token', token);
    // 跳转到主页
  } catch (error) {
    console.error('登录失败:', error.response?.data);
  }
};

// 获取学生列表
const fetchStudents = async () => {
  try {
    const data = await studentAPI.list({
      page: 0,
      size: 10,
      sort: 'id,desc'
    });
    console.log('学生列表:', data.content);
    console.log('总数:', data.totalElements);
  } catch (error) {
    console.error('获取失败:', error);
  }
};

// 创建学生
const createStudent = async () => {
  try {
    const student = await studentAPI.create({
      studentNo: '2025001',
      name: '张三',
      gender: '男',
      dob: '2005-06-15',
      phone: '13800001111',
      className: '高一1班'
    });
    console.log('创建成功:', student);
  } catch (error) {
    if (error.response?.data?.errors) {
      // 显示验证错误
      error.response.data.errors.forEach(err => console.error(err));
    }
  }
};
```

---

## 附录

### CORS 配置说明

后端已配置 CORS，允许前端跨域访问：
- 允许的源：所有来源（开发环境）
- 允许的方法：GET, POST, PUT, DELETE, PATCH, OPTIONS
- 允许的请求头：Authorization, Content-Type 等

### 数据库支持

- **生产环境**：MySQL
- **测试环境**：H2（内存数据库）

---

**文档版本**: v1.0  
**最后更新**: 2025-11-27  
**维护者**: 开发团队
