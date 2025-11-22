package com.example.studentsystem.service;

import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.dto.StudentResponseDto;
import com.example.studentsystem.exception.DuplicateResourceException;
import com.example.studentsystem.mapper.StudentMapper;
import com.example.studentsystem.model.Student;
import com.example.studentsystem.repository.StudentRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        //学号唯一
        repo.findByStudentNo(dto.getStudentNo()).ifPresent(s -> {
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
    public Optional<StudentResponseDto> getById(Long id) {
        return repo.findById(id).map(StudentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    //根据ID获取学生记录
    public Page<StudentResponseDto> list(Pageable pageable, String studentNo) {
        // 若提供 studentNo，则按“包含”进行模糊分页查询（用户输入越多，结果越少）
        if (studentNo != null && !studentNo.isBlank()) {
            return repo.findByStudentNoContaining(studentNo, pageable).map(StudentMapper::toDto);
        }
        // 默认返回全部（分页）
        return repo.findAll(pageable).map(StudentMapper::toDto);
    }

    @Override
    //更新学生记录
    public Optional<StudentResponseDto> update(Long id, StudentRequestDto dto) {
        return repo.findById(id).map(existing -> {
            StudentMapper.updateEntityFromDto(dto, existing);
            Student saved = repo.save(existing);
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