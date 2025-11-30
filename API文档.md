# 学生管理系统 - 后端接口文档

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
- **公开接口**：`/api/auth/register`、`/api/auth/login`
- **需要认证**：所有其他接口（`/api/students/*`、`/api/todos/*`）

---

## 认证接口

### 1. 用户注册

**接口**: `POST /api/auth/register`

**权限**: 公开

**请求体**:
```json
{
  "username": "admin",
  "password": "123456",
  "email": "example@qq.com"
}
```

**字段说明**

| 字段       | 类型     | 必填 | 说明                           |
|----------|--------|----|------------------------------|
| username | String | ✅  | 用户名，3-20 个字符                 |
| password | String | ✅  | 密码，至少 6 个字符                  |
| email    | String | ✅  | 邮箱地址，仅支持 QQ 邮箱和网易邮箱，需先完成邮箱验证 |

**成功响应**: `200 OK`
```json
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

**注意事项**:
- 注册前必须先验证邮箱，调用邮箱验证码发送和校验接口
- 邮箱仅支持 @qq.com 和 @163.com 域名

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

### 3. 发送邮箱验证码

**接口**: `POST /api/auth/email/code/send`

**权限**: 公开

**请求体**:
```json
{
  "email": "example@qq.com"
}
```





**成功响应**: `200 OK`
```json
{
  "code": 0,
  "message": "验证码已发送"
}
```

**失败响应**:

| 错误码  | 说明     | 示例                                                  |
|------|--------|-----------------------------------------------------|
| 1001 | 邮箱格式错误 | `{"code": 1001, "message": "邮箱格式不正确，仅支持QQ邮箱和网易邮箱"}` |
| 1002 | 邮箱已注册  | `{"code": 1002, "message": "该邮箱已注册"}`               |
| 1003 | 频率限制   | `{"code": 1003, "message": "操作过于频繁，请 60 秒后再试"}`     |
| 1500 | 邮件服务异常 | `{"code": 1500, "message": "邮件服务异常，请稍后再试"}`         |

**频率限制**:
- 同一邮箱两次发送间隔：60秒
- 每日发送上限：10次

**验证码规则**:
- 长度：6位数字
- 有效期：5分钟

---

### 4. 校验邮箱验证码

**接口**: `POST /api/auth/email/code/verify`

**权限**: 公开

**请求体**:
```json
{
  "email": "example@qq.com",
  "code": "123456"
}
```

**成功响应**: `200 OK`
```json
{
  "code": 0,
  "message": "验证通过"
}
```

**失败响应**:

| 错误码  | 说明        | 示例                                             |
|------|-----------|------------------------------------------------|
| 2001 | 验证码错误     | `{"code": 2001, "message": "验证码错误，还可尝试 3 次"}`  |
| 2002 | 验证码过期/不存在 | `{"code": 2002, "message": "验证码已过期，请重新获取"}`    |
| 2003 | 错误次数超限    | `{"code": 2003, "message": "错误次数过多，请重新获取验证码"}` |

**校验规则**:
- 最大错误次数：5次
- 超过限制后验证码作废，需重新发送

**注册流程**:
1. 用户填写基础信息（用户名、密码、图形验证码）
2. 调用 `/api/auth/email/code/send` 发送邮箱验证码
3. 用户输入收到的验证码
4. 调用 `/api/auth/email/code/verify` 校验验证码
5. 验证通过后调用 `/api/auth/register` 完成注册

---

## 学生管理接口

### 1. 获取学生列表（分页）

**接口**: `GET /api/students`

**权限**: 需要认证

**请求参数**:

| 参数        | 类型      | 必填 | 默认值     | 说明                            |
|-----------|---------|----|---------|-------------------------------|
| studentNo | String  | 否  | -       | 学号筛选                          |
| name      | String  | 否  | -       | 姓名筛选（模糊查询）                    |
| className | String  | 否  | -       | 班级筛选                          |
| page      | Integer | 否  | 0       | 页码，从0开始                       |
| size      | Integer | 否  | 20      | 每页数量                          |
| sort      | String  | 否  | id,desc | 排序规则，如：`name,asc` 或 `id,desc` |

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
  "address": "北京市朝阳区",
  "className": "高一1班"
}
```

**字段说明**:

| 字段        | 类型     | 必填 | 验证规则                   | 说明     |
|-----------|--------|----|------------------------|--------|
| studentNo | String | ✅  | 不能为空，最大50字符            | 学号     |
| name      | String | ✅  | 不能为空，最大100字符           | 姓名     |
| gender    | String | ❌  | -                      | 性别     |
| dob       | String | ❌  | 必须是过去的日期，格式：YYYY-MM-DD | 出生日期   |
| phone     | String | ❌  | 以1开头的11位数字             | 监护人手机号 |
| address   | String | ❌  | -                      | 地址     |
| className | String | ❌  | 最大100字符                | 班级名称   |

**成功响应**: `200 OK`
```json
{
  "id": 1,
  "studentNo": "2025001",
  "name": "张三",
  "gender": "男",
  "dob": "2005-06-15",
  "phone": "13800001111",
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

| 参数 | 类型   | 说明   |
|----|------|------|
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

| 参数 | 类型   | 说明   |
|----|------|------|
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

### 5.1 批量删除学生

**接口**: `DELETE /api/students/batch`

**权限**: 需要认证

**请求体**:
```json
[1, 2, 3, 4, 5]
```

**字段说明**:
- 请求体为学生ID的数组
- 数组不能为空

**请求示例**:
```javascript
fetch('/api/students/batch', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([1, 2, 3])
});
```

**成功响应**: `200 OK`
```json
"成功删除 3 条学生记录"
```

**失败响应**: `400 Bad Request`
```json
"删除列表不能为空"
```

---

### 6. 批量导入学生（Excel）

**接口**: `POST /api/students/import`

**权限**: 需要认证

**请求类型**: `multipart/form-data`


**请求参数**:

| 参数   | 类型   | 必填 | 说明               |
|------|------|----|------------------|
| file | File | ✅  | Excel文件（.xlsx格式） |

**Excel 格式说明**:

| 列序号 | 列名     | 必填 | 说明            |
|-----|--------|----|---------------|
| 第1列 | 姓名     | ❌  | 学生姓名          |
| 第2列 | 学号     | ✅  | 学号（必填，用于唯一标识） |
| 第3列 | 班级     | ❌  | 班级名称          |
| 第4列 | 监护人手机号 | ❌  | 11位手机号        |

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

| 姓名 | 学号      | 班级   | 监护人手机号      |
|----|---------|------|-------------|
| 张三 | 2025001 | 高一1班 | 13800001111 |
| 李四 | 2025002 | 高一2班 | 13800002222 |

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

| 字段   | 类型     | 必填 | 说明        |
|------|--------|----|-----------|
| text | String | ✅  | 待办内容，不能为空 |

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

| 字段        | 类型      | 说明                  |
|-----------|---------|---------------------|
| timestamp | String  | 错误发生时间              |
| status    | Integer | HTTP 状态码            |
| error     | String  | 错误类型                |
| message   | String  | 错误消息                |
| path      | String  | 请求路径                |
| errors    | Array   | 详细错误列表（可选，仅验证错误时存在） |

---

### 常见 HTTP 状态码

| 状态码 | 说明    | 常见场景            |
|-----|-------|-----------------|
| 200 | 成功    | 请求成功处理          |
| 204 | 无内容   | 删除成功            |
| 400 | 请求错误  | 参数验证失败、JSON格式错误 |
| 401 | 未认证   | 未登录、Token 无效或过期 |
| 403 | 禁止访问  | 无权限访问资源         |
| 404 | 未找到   | 资源不存在           |
| 409 | 冲突    | 数据重复（如学号已存在）    |
| 500 | 服务器错误 | 服务器内部错误         |

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
