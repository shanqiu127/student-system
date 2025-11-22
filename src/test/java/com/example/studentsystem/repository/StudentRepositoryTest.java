package com.example.studentsystem.repository;

import com.example.studentsystem.model.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class StudentRepositoryTest {

    @Autowired
    private StudentRepository repo;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("保存并按学号精确查找学生")
    void save_and_findByStudentNo() {
        Student s = new Student();
        s.setStudentNo("S200");
        s.setName("测试200");
        s.setDob(LocalDate.of(2004, 1, 1));
        // 监护人手机号，实体字段已经是 phone
        s.setPhone("13800001234");
        Student saved = repo.save(s);

        Optional<Student> found = repo.findByStudentNo("S200");
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("按学号模糊查找学生（分页）")
    void findByStudentNoContaining_paging() {
        Student s1 = new Student();
        s1.setStudentNo("S2101");
        s1.setName("学生2101");
        s1.setDob(LocalDate.of(2005, 1, 1));
        s1.setPhone("13800001111");
        repo.save(s1);

        Student s2 = new Student();
        s2.setStudentNo("S2102");
        s2.setName("学生2102");
        s2.setDob(LocalDate.of(2005, 2, 2));
        s2.setPhone("13800002222");
        repo.save(s2);

        Page<Student> page = repo.findByStudentNoContaining("S210", PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(2);
        assertThat(page.getContent())
                .extracting(Student::getStudentNo)
                .contains("S2101", "S2102");
    }
}
