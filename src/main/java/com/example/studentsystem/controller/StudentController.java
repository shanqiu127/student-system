package com.example.studentsystem.controller;

import com.example.studentsystem.dto.StudentRequestDto;  // 导入请求DTO，用于接收学生数据
import com.example.studentsystem.dto.StudentResponseDto;  // 导入响应DTO，用于返回学生数据
import com.example.studentsystem.service.StudentService;  // 导入服务接口，用于业务逻辑
import org.springframework.data.domain.Page;  // 导入Page类，用于分页结果
import org.springframework.data.domain.Pageable;  // 导入Pageable接口，用于分页参数
import org.springframework.http.ResponseEntity;  // 导入ResponseEntity，用于构建HTTP响应
import org.springframework.web.bind.annotation.*;  // 导入Spring Web注解，用于REST API
import java.util.List;
import jakarta.validation.Valid;  // 导入Valid注解，用于验证请求体

@RestController  // 标记此类为REST控制器，提供REST API
@RequestMapping("/api/students")  // 指定基础请求路径为/api/students
public class StudentController {

    private final StudentService service;  // 声明StudentService依赖，用于业务逻辑操作

    // 构造器注入StudentService
    public StudentController(StudentService service) {
        this.service = service;
    }
    // 定义分页响应记录，包含内容、总元素数、总页数和当前页码
    public record PagedResponse<T>(List<T> content, long totalElements, int totalPages, int pageNumber) {}
    @GetMapping
    // 处理GET请求，列出学生，支持分页和过滤
    public PagedResponse<StudentResponseDto> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String studentNo,
            Pageable pageable) {
        Page<StudentResponseDto> page = service.list(pageable, name, studentNo);
        // 自定义返回分页数据结构
        return new PagedResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber()
        );
    }

    @GetMapping("/{id}")  // 处理GET请求，根据ID获取单个学生
    public ResponseEntity<StudentResponseDto> get(@PathVariable Long id) {
        // 调用服务层获取学生，若存在返回200 OK，否则返回404 Not Found
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping  // 处理POST请求，创建新学生
    public ResponseEntity<StudentResponseDto> create(@Valid @RequestBody StudentRequestDto dto) {
        // 使用@Valid验证请求体，调用服务层创建学生，返回201 Created
        StudentResponseDto created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")  // 处理PUT请求，更新现有学生
    public ResponseEntity<StudentResponseDto> update(@PathVariable Long id, @Valid @RequestBody StudentRequestDto dto) {
        // 使用@Valid验证请求体，调用服务层更新学生，若成功返回200 OK，否则返回404 Not Found
        return service.update(id, dto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")  // 处理DELETE请求，删除学生
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // 调用服务层删除学生，若不存在返回404 Not Found，否则返回204 No Content
        if (!service.delete(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}