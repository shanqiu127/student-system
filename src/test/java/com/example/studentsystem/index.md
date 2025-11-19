# 测试索引说明（StudentService / StudentRepository / StudentController）

概述  
本说明文档介绍项目中三类关键自动化测试：Service 单元测试、Repository 数据层集成测试和 Controller 集成测试。

目录
- Service 单元测试 — StudentServiceTest
- Repository 集成测试 — StudentRepositoryTest
- Controller 集成测试 — StudentControllerTest
- 在测试类中添加@WithMockUser(username = "admin", roles = {"ADMIN"})
- -用于在单元测试或集成测试中模拟一个已认证的用户，防止访问权限控制的接口时出现 403 错误。

---

## 1. Service 单元测试 — StudentServiceTest
- 路径（示例）  
  `src/test/java/com/example/studentsystem/service/StudentServiceTest.java`

- 测试目的  
  隔离验证 Service 层业务逻辑（不启动 Spring 上下文、不连接真实数据库），使用 Mockito Mock StudentRepository，确保核心业务规则与分支行为正确：
    - 创建学生：正常路径（保存成功）
    - 创建学生：学号已存在时抛出 DuplicateResourceException
    - list 方法：按 studentNo 精确查找返回单元素的 Page
    - list 方法：默认返回分页（repo.findAll）

- 主要测试方法（举例）
    - `create_success()`：模拟 repo.findByStudentNo 返回 empty，repo.save 返回带 id 的 Student，断言返回 DTO 字段正确并调用 save。
    - `create_whenStudentNoExists_thenThrowDuplicateResourceException()`：模拟 repo.findByStudentNo 返回存在的实体，断言抛出 DuplicateResourceException 并且未调用 save。
    - `list_byStudentNo_returnsPageWithOne()`：模拟 repo.findByStudentNo 返回实体，断言 service.list 返回 Page，总数为1。
    - `list_all_returnsPage()`：模拟 repo.findAll 返回 PageImpl，断言映射与总数正确。

- 实现方式
    - 快速执行、定位明确（定位业务层 bug）。

- 运行与期望
    - 执行单测：IDE 右键运行类
    - 期望：所有测试通过（绿色勾）。

---

## 2. Repository 集成测试 — StudentRepositoryTest
- 路径（示例）  
  `src/test/java/com/example/studentsystem/repository/StudentRepositoryTest.java`

- 测试目的  
  验证 JPA 实体映射、Repository 自定义查询与分页在真实数据库环境下的行为。通常使用内存 H2 数据库或 Testcontainers 提供的数据库运行，确保 SQL、索引和查询方法（如 `findByStudentNo`、`findByNameContainingIgnoreCase`）按预期工作。

- 主要测试方法（举例）
    - `save_and_findByStudentNo()`：保存实体后通过 `findByStudentNo` 能查回并且 id 匹配。
    - `findByNameContainingIgnoreCase_paging()`：插入多个名字包含关键字的实体，使用 `findByNameContainingIgnoreCase("zhang", PageRequest.of(...))` 验证分页结果与 totalElements。

- 关键点/实现方式
    - 使用 `@DataJpaTest` 并推荐加上 `@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)`，确保使用嵌入式 DB（如果 classpath 有 H2）。
    - 若你使用 MySQL 或期望更接近生产的行为，建议使用 Testcontainers（Docker 环境）。

- 必要依赖与配置
    - `spring-boot-starter-data-jpa`（项目主依赖）
    - 测试范围内需有 H2：`com.h2database:h2`（scope=test）或在 CI 中用 Testcontainers 配置。
   
- 期望
    - 期望：测试能在内存 DB 下成功创建/查询实体。

---

## 3. Controller 集成测试 — StudentControllerTest
- 路径（示例）  
  `src/test/java/com/example/studentsystem/controller/StudentControllerTest.java`

- 测试目的  
  验证请求-响应链（Controller 层）与 API 合约：反序列化、字段校验（@Valid）、业务调用、HTTP 状态、异常处理（GlobalExceptionHandler）等。常用 MockMvc 或 `@SpringBootTest` + `@AutoConfigureMockMvc` 启动应用上下文进行全栈（轻量级）测试。

- 主要测试方法（举例）
    - `create_and_get_and_delete_flow()`：通过 MockMvc 发起 POST 创建，再 GET 验证内容，DELETE 后验证 204，删除后 GET 返回 404。覆盖常见 CRUD 流程。
    - `create_validationFails_returnsBadRequest()`：发送缺失必填字段的请求，断言 HTTP 400 并检查响应中包含 `errors` 字段（由 GlobalExceptionHandler 提供的统一错误体）。

- 关键点/实现方式
    - 使用 `@SpringBootTest` + `@AutoConfigureMockMvc` 启动上下文并自动注入 `MockMvc`。
    - 测试中可直接使用真实 Repository（集成测试）或在 `@WebMvcTest` 中 Mock Service（仅测试 web 层）。
    - 每个测试前用 `repo.deleteAll()` 清理数据，保证测试隔离。

- 期望
    - 期望：请求与响应的状态码与 JSON 结构符合断言（200/204/404/400 等）。





