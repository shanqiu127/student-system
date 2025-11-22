package com.example.studentsystem.repository;

import com.example.studentsystem.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
//是一个 Spring Data JPA 的 "仓库" 接口，声明了对 Student 实体的持久化操作
public interface StudentRepository extends JpaRepository<Student, Long> {
    // 精确查询：根据学生编号查找学生
    Optional<Student> findByStudentNo(String studentNo);

    // 按学号模糊/前缀查询（包含关系）
    Page<Student> findByStudentNoContaining(String studentNo, Pageable pageable);
}
