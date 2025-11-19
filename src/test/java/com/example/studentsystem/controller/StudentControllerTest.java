// java
package com.example.studentsystem.controller;

import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.model.Student;
import com.example.studentsystem.repository.StudentRepository;      // 直接清库以保证测试独立性
import com.fasterxml.jackson.databind.ObjectMapper;                 // 序列化/反序列化 JSON
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc; // 启用 MockMvc 自动配置
import org.springframework.boot.test.context.SpringBootTest;         // 启动完整 Spring 容器，做集成测试
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*; // 构造 HTTP 请求（GET/POST/DELETE）
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;  // 断言响应结果

/**
 * 集成测试：通过 MockMvc 调用真实的 StudentController
 * 关联：
 *   StudentController:
 *     POST /api/students -> service.create -> 返回 StudentResponseDto(JSON含 id, studentNo 等)
 *     GET  /api/students/{id} -> service.getById -> 找不到返回 404
 *     DELETE /api/students/{id} -> service.delete -> 成功 204, 不存在 404
 *   StudentRequestDto: 使用 Bean Validation（@NotBlank, @Past, @Email）触发 400 错误
 *   StudentRepository: 在测试前清空，保证用例互不干扰
 *   Student: 实体字段映射到 JSON 响应（通过 mapper/service 层）
 */
@SpringBootTest                // 启动整个应用上下文，默认加载所有 Bean
@AutoConfigureMockMvc          // 注入 MockMvc，模拟 HTTP 层
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;   // 用于发起模拟的 HTTP 请求

    @Autowired
    private StudentRepository repo; // 直接操作仓库以清理数据，避免脏数据影响用例

    @Autowired
    private ObjectMapper objectMapper; // JSON 序列化与解析

    @BeforeEach
    void setUp() {
        // 先清空 students 表，确保每个测试从空状态开始
        repo.deleteAll();
    }

    @Test
    //用于在单元测试或集成测试中模拟一个已认证的用户
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void create_and_get_and_delete_flow() throws Exception {
        // 构造一个合法的请求 DTO，符合 StudentRequestDto 的校验约束
        StudentRequestDto req = new StudentRequestDto();
        req.setStudentNo("T100");                 // 唯一学号，对应实体 studentNo
        req.setName("测试用户");                   // 必填 name
        req.setDob(LocalDate.of(2005,7,1));       // @Past 满足过去日期
        req.setEmail("test@example.com");         // 合法邮箱格式

        String json = objectMapper.writeValueAsString(req); // 序列化为请求体

        // 发送创建请求：间接调用（先调用Controller的created->service.create -> 保存实体并返回响应 DTO
        String resp = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())                  // 期望 200（当前实现返回 OK 而非 201）
                .andExpect(jsonPath("$.studentNo").value("T100")) // 校验返回学号字段映射正确
                .andReturn().getResponse().getContentAsString();

        // 解析返回 JSON 中的 id 字段，用于后续 GET / DELETE
        var node = objectMapper.readTree(resp);
        long id = node.get("id").asLong(); // id 来自 JPA 持久化后的自增主键

        // 按 id 查询 ：调用 service.getById -> 找到返回 DTO 映射为 JSON
        mockMvc.perform(get("/api/students/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))            // 校验主键
                .andExpect(jsonPath("$.name").value("测试用户"));  // 校验 name 映射

        // 删除： 删除成功返回 204 No Content
        mockMvc.perform(delete("/api/students/{id}", id))
                .andExpect(status().isNoContent());

        // 再次查询：因已删除，控制器返回 404
        mockMvc.perform(get("/api/students/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    // 测试 “无效输入”的请求能不能正常触发 400 错误
    void create_validationFails_returnsBadRequest() throws Exception {
        StudentRequestDto req = new StudentRequestDto();
        // 未设置字段 -> 触发 Bean Validation
        String json = objectMapper.writeValueAsString(req);

        // 发送创建请求：@Valid 失败 -> Spring 自动返回 400，并包含错误详情（需全局异常处理配置）
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())          // 验证 HTTP 400
                .andExpect(jsonPath("$.errors").exists());   // 断言返回体含错误集合（取决于异常处理器实现）
    }
}
