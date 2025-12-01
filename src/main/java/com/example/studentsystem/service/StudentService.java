package com.example.studentsystem.service;

import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.dto.StudentResponseDto;
import com.example.studentsystem.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
//属于服务层的接口，实现对学生操作（增删改查 + 列表分页）。
//引用了StudentRequestDto(请求数据源）和StudentResponseDto（create，getById，List，update，delete方法的返回值）。
//spring Data的Page和Pageable用于分页支持。
//所有操作都基于当前登录用户，实现数据隔离。
public interface StudentService {
    // 创建一个新的学生记录，接受StudentRequestDto，返回StudentResponseDto。
    StudentResponseDto create(StudentRequestDto dto, User user);
    // 根据ID获取学生记录，返回Optional<StudentResponseDto>，找不到时为空。
    Optional<StudentResponseDto> getById(Long id, User user);
    // 列出学生记录，仅支持按 studentNo 模糊查询（全部）
    Page<StudentResponseDto> list(Pageable pageable, String studentNo, User user);
    // 更新学生记录
    Optional<StudentResponseDto> update(Long id, StudentRequestDto dto, User user);
    // 删除学生记录，返回删除是否成功的布尔值。
    boolean delete(Long id, User user);
}