
package com.example.studentsystem.service;

import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.dto.StudentResponseDto;
import com.example.studentsystem.exception.DuplicateResourceException;
import com.example.studentsystem.mapper.StudentMapper;
import com.example.studentsystem.model.Student;
import com.example.studentsystem.repository.StudentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // 注册自定义扩展：@Mock/@InjectMocks对象
class StudentServiceTest {

    @Mock // 模拟StudentRepository对象用来模拟数据库操作
    private StudentRepository repo;
    @InjectMocks // 注入依赖（真正的被测实例，repo 会被注入到它里边）
    private StudentServiceImpl service;

    private Student sampleStudent;      // 仓库返回的模拟实体
    private StudentRequestDto sampleRequest; // create方法输入的请求 DTO

    @BeforeEach
    //先执行 setUp，再进行@Test
    void setUp() {
        // 构造一个请求 DTO，模拟客户端提交数据；字段与实体对应
        sampleRequest = new StudentRequestDto();
        sampleRequest.setStudentNo("S100");
        sampleRequest.setName("张三");
        sampleRequest.setDob(LocalDate.of(2005,7,1));
        sampleRequest.setEmail("test@example.com");

        // 再继续构造一个已有的实体对象
        sampleStudent = new Student();
        sampleStudent.setId(1L);
        sampleStudent.setStudentNo("S100");
        sampleStudent.setName("张三");
        sampleStudent.setDob(LocalDate.of(2005,7,1));
        sampleStudent.setEmail("test@example.com");
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    // 创建时学号重复
    void create_whenStudentNoExists_thenThrowDuplicateResourceException() {

        // repo.findByStudentNo 返回 Optional.of(sampleStudent) 表示学号已存在
        when(repo.findByStudentNo("S100")).thenReturn(Optional.of(sampleStudent));

        // 也就是触发 StudentServiceImpl.create 中的重复校验方法，抛出 DuplicateResourceException
        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> {
            service.create(sampleRequest);
        });
        // 验证异常消息包含“studentNo 已存在”
        assertTrue(ex.getMessage().contains("studentNo 已存在"));
        // 验证：由于失败（重复），所以repo.save 不应该被调用
        verify(repo, never()).save(any());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void create_success() {
        // 正常保存
        when(repo.findByStudentNo("S100")).thenReturn(Optional.empty());
        // 模拟 repo.save: 给保存后的实体设置一个新生成的 id（模拟数据库自增）
        when(repo.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(2L);
            return s;
        });

        // 成功之后实现DTO->实体对象->再保存到数据库再—> DTO
        StudentResponseDto resp = service.create(sampleRequest);
        // 验证结果
        assertNotNull(resp);
        assertEquals("S100", resp.getStudentNo());
        assertEquals("张三", resp.getName());
        // 验证保存调用一次
        verify(repo, times(1)).save(any(Student.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void list_byStudentNo_returnsPageWithOne() {
        // 按 studentNo 精确查询（list 方法分支一）
        when(repo.findByStudentNo("S100")).thenReturn(Optional.of(sampleStudent));

        PageRequest pageable = PageRequest.of(0, 10);
        // 调用 list，传入 studentNo，name 为 null -> 应为精确查询分支
        Page<StudentResponseDto> result = service.list(pageable, null, "S100");
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("S100", result.getContent().get(0).getStudentNo());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void list_all_returnsPage() {
        // 场景：无 studentNo 与 name，走默认 repo.findAll(pageable)
        when(repo.findAll(PageRequest.of(0,10))).thenReturn(new PageImpl<>(Collections.singletonList(sampleStudent)));

        PageRequest pageable = PageRequest.of(0, 10);
        Page<StudentResponseDto> page = service.list(pageable, null, null);

        // PageImpl 中总元素数为 1
        assertEquals(1, page.getTotalElements());
    }
}
