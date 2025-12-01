package com.example.studentsystem.repository;

import com.example.studentsystem.model.Student;
import com.example.studentsystem.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
//是一个 Spring Data JPA 的 "仓库" 接口，声明了对 Student 实体的持久化操作
public interface StudentRepository extends JpaRepository<Student, Long> {
    // 根据用户和学生编号查找学生（确保在用户内唯一）
    Optional<Student> findByUserAndStudentNo(User user, String studentNo);

    // 按学号模糊/前缀查询（包含关系），只查询当前用户的数据
    Page<Student> findByUserAndStudentNoContaining(User user, String studentNo, Pageable pageable);
    
    // 查询当前用户的所有学生
    Page<Student> findByUser(User user, Pageable pageable);
    
    // 根据ID和用户查找学生（确保只能操作自己的数据）
    Optional<Student> findByIdAndUser(Long id, User user);
    
    // 检查学生ID是否存在且属于该用户
    boolean existsByIdAndUser(Long id, User user);
}
