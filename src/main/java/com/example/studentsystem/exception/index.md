# 输入校验与统一异常处理
## 概要
实现 DTO 字段校验（jakarta.validation）与全局异常处理，保证输入数据质量并向客户端返回统一的错误格式（ErrorResponse）。

## 本次实现
- 在 DTO（StudentRequestDto）上使用注解：
    - `@NotBlank`, `@Size`, `@Email`, `@Past` 等
- Controller 参数使用 `@Valid` 触发校验
- Service 层对业务规则做校验（如学号唯一），冲突抛出 `DuplicateResourceException`
- 统一错误响应模型 `ErrorResponse`（timestamp/status/error/message/path/errors）
- 全局异常处理器 `GlobalExceptionHandler`：
    - 处理 `MethodArgumentNotValidException` -> 400（返回字段级 errors）
    - 处理 `HttpMessageNotReadableException` -> 400（JSON/日期解析错误）
    - 处理 `MethodArgumentTypeMismatchException` -> 400（参数类型不匹配）
    - 处理 `DuplicateResourceException` -> 409
    - 处理 `DataIntegrityViolationException` -> 409
    - 处理 `EntityNotFoundException` -> 404
    - 兜底 `Exception` -> 500

## ErrorResponse 结构
```json
{
  "timestamp": "2025-11-05T...",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/students",
  "errors": ["studentNo: 学号不能为空", "email: 邮箱格式不正确"]
}
```

## 请求/响应示例
- 校验失败：
    - Request:
      ```json
      {"name":"仅有名字"}
      ```
    - Response: 400 + ErrorResponse（含 errors 列表）

- 重复学号：
    - Request:
      ```json
      {"studentNo":"S100","name":"重复"}
      ```
    - Response: 409
      ```json
      {
        "timestamp":"...",
        "status":409,
        "error":"Conflict",
        "message":"studentNo 已存在: S100",
        "path":"/api/students"
      }
      ```




