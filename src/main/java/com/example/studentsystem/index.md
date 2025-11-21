# 项目结构说明
controller：HTTP 层，接收请求、做最少量的请求参数校验（@Valid）、调用 Service，返回 HTTP 响应。
dto：数据传输对象（请求/响应模型），用于在 Controller 与 Service/外部之间传递数据，避免直接暴露实体。
mapper：负责 DTO ↔ Entity（model）的相互转换（手写或 MapStruct）。
service：业务层，包含业务逻辑、事务边界、业务校验（如学号唯一）、调用 repository 完成持久化。
repository：数据访问层（Spring Data JPA 接口），负责与数据库交互（CRUD、查询）。
model：JPA 实体，映射数据库表结构。
exception：存放自定义异常、统一错误响应模型和全局异常处理器（@ControllerAdvice/@RestControllerAdvice）。

　　

　　
# 请求处理流程示例（创建学生）
客户端发送： { "studentNo": "S001", "name": "张三", "dob": "2005-07-01", "email": "a@b.com" }
Controller 收到 DTO（StudentRequestDto）： dto.studentNo="S001", dto.name="张三", ...
Service -> mapper -> Entity(Student): student.setStudentNo("S001"); student.setName("张三"); ...
repository.save(student) -> DB（students 表）
DB 返回包含 id 的实体 -> mapper -> StudentResponseDto
Controller 返回给客户端： { "id":1, "studentNo":"S001", "name":"张三", ... }
# 请求处理详细流程
假设客户端发出 POST /api/students 创建学生（JSON body）：
HTTP 接入层（DispatcherServlet）
Spring 的 DispatcherServlet 将请求路由到对应 Controller 的方法（StudentController.create）。
Jackson 将请求 JSON 反序列化为 StudentRequestDto（dto 包）。
Controller 的 @Valid 触发 Jakarta Validation（注解在 DTO 字段上，如 @NotBlank），如果校验失败抛 MethodArgumentNotValidException（不会进入 Service）。
Controller 校验 & 入参处理
若校验通过，Controller 将 DTO 传给 Service（service.create(dto)）。
Controller 不做业务逻辑，只负责参数校验、HTTP 状态码包装和返回。
Service 层（业务逻辑 + 事务）
StudentServiceImpl.create(StudentRequestDto dto)：
先做业务校验（例如 repo.findByStudentNo(dto.getStudentNo()) 检查是否已存在），若存在抛 DuplicateResourceException（exception 包）。
若校验通过，调用 StudentMapper.toEntity(dto)（mapper 包）将 DTO 转为 Student 实体（model 包）。
调用 StudentRepository.save(student)（repository 包）持久化实体到数据库（由 Spring Data JPA 实现）。
将保存后的实体再用 mapper 转成 StudentResponseDto 返回给 Controller。
事务边界通常在 Service 类（@Transactional 注解放在 Service 实现类或方法上）。事务确保 save 操作要么全部成功要么回滚。
Repository -> Database
StudentRepository（interface extends JpaRepository）把 save/find 操作翻译成 SQL，通过 Hibernate/JDBC 执行到 MySQL，返回实体对象或 Optional。
返回过程
Service 把 StudentResponseDto 返回给 Controller。
Controller 封装成 ResponseEntity 并返回给客户端（HTTP 200/201 等）。



# 在wsl运行后端端口的命令
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
可以在验证：http://localhost:8081/