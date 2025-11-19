package com.example.studentsystem;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
class StudentSystemApplicationTests {

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void contextLoads() {
    }

}
