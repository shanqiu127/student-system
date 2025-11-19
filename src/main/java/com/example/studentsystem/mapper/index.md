# Mapper 层说明
StudentMapper 用于在持久层实体 Student 与前端/Controller 使用的 DTO（StudentRequestDto、StudentResponseDto）之间做转换，避免直接暴露实体，保持分层清晰并便于验证与序列化。
## 方法说明
- toEntity(StudentRequestDto dto)
- - 将请求 DTO 转为新的 Student 实体，用于新增记录。会把 DTO 的字段复制到实体，遇到 null 返回 null。
- toDto(Student s)
- - 将 Student 实体转为响应 DTO（包含 id），用于向客户端返回数据，遇到 null 返回 null。
- updateEntityFromDto(StudentRequestDto dto, Student s)
- - 使用 DTO 覆盖已有实体的字段，用于更新操作（保留实体的 id 等持久化信息）。


