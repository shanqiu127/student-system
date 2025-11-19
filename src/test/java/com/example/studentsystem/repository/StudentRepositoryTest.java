package com.example.studentsystem.repository;

import com.example.studentsystem.model.Student;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
//引用对jpa实体操作的测试注解
class StudentRepositoryTest {

    @Autowired
    private StudentRepository repo;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("保存并按学号查找学生")
    void save_and_findByStudentNo() {
        Student s = new Student();
        s.setStudentNo("S200");
        s.setName("测试200");
        s.setDob(LocalDate.of(2004,1,1));
        s.setEmail("s200@example.com");
        Student saved = repo.save(s);

        Optional<Student> found = repo.findByStudentNo("S200");
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("按姓名模糊查找学生（不区分大小写）")
    void findByNameContainingIgnoreCase_paging() {
        Student s1 = new Student();
        s1.setStudentNo("S21");
        s1.setName("Zhang San");
        s1.setDob(LocalDate.of(2005,1,1));
        repo.save(s1);

        Student s2 = new Student();
        s2.setStudentNo("S22");
        s2.setName("Li Zhang");
        s2.setDob(LocalDate.of(2005,2,2));
        repo.save(s2);

        Page<Student> page = repo.findByNameContainingIgnoreCase("zhang", PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(2);
        assertThat(page.getContent()).extracting("name").containsExactlyInAnyOrder("Zhang San", "Li Zhang");
    }
}
