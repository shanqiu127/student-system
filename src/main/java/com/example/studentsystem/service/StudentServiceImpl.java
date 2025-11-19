package com.example.studentsystem.service;

import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.dto.StudentResponseDto;
import com.example.studentsystem.exception.DuplicateResourceException;
import com.example.studentsystem.mapper.StudentMapper;
import com.example.studentsystem.model.Student;
import com.example.studentsystem.repository.StudentRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {
    //repo对 Student 实体执行 增删查改、分页、排序 等操作
    private final StudentRepository repo;

    public StudentServiceImpl(StudentRepository repo) {
        this.repo = repo;
    }

    @Override
    public StudentResponseDto create(StudentRequestDto dto) {
        // 检查是否已经存在：学号唯一
        repo.findByStudentNo(dto.getStudentNo()).ifPresent(s -> {
            //dto.getStudentNo()调用传入的 StudentRequestDto 对象的 getter，返回该请求 DTO 中的“学号”字段（通常是 String）
            //DuplicateResourceException自定义异常，表示创建学生已存在
            throw new DuplicateResourceException("studentNo 已存在: " + dto.getStudentNo());
        });
        //将 DTO 转换为实体对象
        Student s = StudentMapper.toEntity(dto);
        //保存实体对象到数据库
        Student saved = repo.save(s);
        //将保存后的实体对象转换为 DTO 并返回
        return StudentMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    //根据ID获取学生记录
    public Optional<StudentResponseDto> getById(Long id) {
        //从数据库中查找学生实体，并转换为 DTO 返回
        //map(StudentMapper::toDto)相当于映射到DTO
        return repo.findById(id).map(StudentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponseDto> list(Pageable pageable, String name, String studentNo) {
        // 优先按 studentNo 精确查询（若提供）
        if (studentNo != null && !studentNo.isBlank()) {
            Optional<Student> found = repo.findByStudentNo(studentNo);
            if (found.isPresent()) {
                StudentResponseDto dto = StudentMapper.toDto(found.get());
                // 构造一个 Page 包装单元素（PageImpl）
                return new PageImpl<>(Collections.singletonList(dto), pageable, 1);
            } else {
                // 返回空页（总元素数为 0）
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        // 若提供 name，则做模糊分页查询
        if (name != null && !name.isBlank()) {
            return repo.findByNameContainingIgnoreCase(name, pageable).map(StudentMapper::toDto);
        }

        // 默认返回全部（分页）
        return repo.findAll(pageable).map(StudentMapper::toDto);
    }

    @Override
    //更新学生记录
    public Optional<StudentResponseDto> update(Long id, StudentRequestDto dto) {
        //根据ID查找现有学生实体，更新其字段并保存
        return repo.findById(id).map(existing -> {
            //使用 DTO 更新现有实体对象的字段
            StudentMapper.updateEntityFromDto(dto, existing);
            //保存更新后的实体对象到数据库
            Student saved = repo.save(existing);
            //将保存后的实体对象转换为 DTO 并返回
            return StudentMapper.toDto(saved);
        });
    }

    @Override
    //删除学生记录
    public boolean delete(Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}