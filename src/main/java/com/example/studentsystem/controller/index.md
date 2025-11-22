# Controller 层说明

## 概述
`StudentController` 提供对学生资源的 RESTful 接口，基路径为 `/api/students`。控制器负责接收 HTTP 请求、校验输入（使用 `StudentRequestDto` 与 `@Valid`）、并将调用委托给 `StudentService`，返回 `StudentResponseDto` 或合适的 HTTP 状态。

## 路由与行为

- `GET /api/students`
    - 描述：返回分页的学生列表。
    - 参数：`Pageable`（页码、大小、排序，通过请求参数传入，如 `?page=0&size=20&sort=name,asc`）。
    - 返回：`Page<StudentResponseDto>`（HTTP 200）。
    - 说明：分页由 Spring Data 提供，Controller 直接返回 Service 的 `Page`。

- `GET /api/students/{id}`
    - 描述：根据 id 查询单个学生。
    - 路径参数：`id` (Long)。
    - 返回：`ResponseEntity<StudentResponseDto>`，存在返回 HTTP 200 与 DTO；不存在返回 HTTP 404。
    - 说明：Service 返回 `Optional<StudentResponseDto>`，控制器用 `map(ResponseEntity::ok).orElse(...)` 处理。

- `POST /api/students`
    - 描述：创建新学生记录。
    - 请求体：`StudentRequestDto`，使用 `@Valid` 进行校验。
    - 返回：当前实现返回 HTTP 200 与创建后的 `StudentResponseDto`（若需改为 HTTP 201，可在返回时使用 `ResponseEntity.created(...)`）。
    - 说明：Controller 将请求转给 Service 的 `create` 方法。

- `PUT /api/students/{id}`
    - 描述：更新指定 id 的学生记录。
    - 路径参数：`id` (Long)。
    - 请求体：`StudentRequestDto`，使用 `@Valid` 校验。
    - 返回：存在并更新成功返回 HTTP 200 与更新后的 `StudentResponseDto`；不存在返回 HTTP 404。
    - 说明：Service 返回 `Optional<StudentResponseDto>`，控制器映射为 `ResponseEntity`。

- `DELETE /api/students/{id}`
    - 描述：删除指定 id 的学生记录。
    - 路径参数：`id` (Long)。
    - 返回：删除成功返回 HTTP 204 No Content；不存在返回 HTTP 404。
    - 说明：Service 的 `delete` 返回 `boolean`，控制器根据其返回值构建响应。
- 'Post /api/students/{import}'
    - 描述：批量导入学生记录。
    - 请求体：`List<StudentRequestDto>`，使用 `@Valid` 校验每个 DTO。
    - 返回：返回 HTTP 200 与导入后的 `List<StudentResponseDto>`。
    - 说明：Controller 将请求转给 Service 的 `importStudents` 方法。
- 'Get /api/students/export'
    - 描述：导出所有学生记录。
    - 返回：返回 HTTP 200 与 `List<StudentResponseDto>`。
    - 说明：Controller 将请求转给 Service 的 `exportStudents` 方法。

## 请求与响应示例

- 创建（请求体示例）
  \```json
{
  "studentNo": "S2025001",
  "name": "张三",
  "gender": "M",
  "dob": "2000-01-01",
  "email": "zhangsan@example.com",
  "phone": "13800000000",
  "address": "某市某区"
}
\```

- 返回（`StudentResponseDto` 示例）
  \```json
{
  "id": 1,
  "studentNo": "S2025001",
  "name": "张三",
  "gender": "M",
  "dob": "2000-01-01",
  "email": "zhangsan@example.com",
  "phone": "13800000000",
  "address": "某市某区"
}
\```

## 校验与错误
- Controller 使用 `@Valid` 校验 `StudentRequestDto`。校验失败会由全局/默认的 Spring 验证机制返回 400 Bad Request（可配置全局异常处理器以统一错误响应格式）。
- 对于未找到的资源，Controller 返回 404 Not Found（GET/PUT/DELETE 中体现）。

## 注意事项
- 按分层原则，Controller 不直接操作实体，仅使用 DTO 与 Service。
- 若需要在 `POST` 创建时返回 `Location` 头并使用 HTTP 201，可修改 `create` 的返回逻辑。
- 保持 DTO 与实体字段同步，Controller 文档与 DTO 文档应一同维护。
