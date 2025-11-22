# DTO 层说明

## 概述
本包提供用于 Controller 与服务层之间的数据传输对象（DTO），避免直接暴露 JPA 实体结构，并用于请求校验与响应序列化。主要 DTO：
- `StudentRequestDto`：用于接收客户端创建/更新请求（含校验注解）。
- `StudentResponseDto`：用于返回给客户端的响应对象（包含 `id` 等持久化字段）。

## StudentRequestDto
用途：接收前端的新增/更新学生数据并在 Controller 层做验证。

字段与校验：
- `studentNo` (String) — 学号，`@NotBlank`，`@Size(max = 50)`
- `name` (String) — 姓名，`@NotBlank`，`@Size(max = 100)`
- `gender` (String) — 性别（可选）
- `dob` (LocalDate) — 出生日期，`@Past`（可选）
- `phone` (String) — 监护人电话
- `address` (String) — 地址（可选）
- `className` (String) — 班级名称（可选，`@Size(max = 100)`）

备注：用于请求验证，通常在 Controller 方法上配合 `@Valid` 使用。

## StudentResponseDto
用途：把持久化的学生数据返回给客户端（序列化为 JSON 等）。

字段：
- `id` (Long)
- `studentNo` (String)
- `name` (String)
- `gender` (String)
- `dob` (LocalDate)
- `phone` (String)
- `address` (String)
- `className` (String)

备注：响应 DTO 不包含校验注解，旨在输出已持久化的数据。

## 常见使用示例（高层说明）
- 新增流程：Controller 接收 `StudentRequestDto`（`@Valid`），Service 使用 `StudentMapper.toEntity(dto)` 将 DTO 转为实体，调用 `repo.save(entity)` 保存，最后 `StudentMapper.toDto(savedEntity)` 转为 `StudentResponseDto` 返回。
- 更新流程：先通过 `repo.findById(id)` 获取实体，使用 `StudentMapper.updateEntityFromDto(dto, entity)` 覆盖字段，`repo.save(entity)`，再返回 DTO。
- 查询流程：`repo.findById(id).map(StudentMapper::toDto)` 返回 `Optional<StudentResponseDto]`，优雅处理空值。
