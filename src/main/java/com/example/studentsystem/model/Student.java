package com.example.studentsystem.model;

import jakarta.persistence.*;  // 导入JPA注解
import java.time.LocalDate;   // 导入LocalDate类，用于处理日期
//可以看成为表结构的 Java 描述 + 提供字段访问/设置的 POJO（普通java对象，用于使用数据库的数据表）
@Entity  // 标记此类为JPA实体，表示它映射到数据库表
@Table(name = "students")  // 指定映射的数据库表名为students
public class Student {
    @Id  // 标记为主键字段
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 主键值由数据库自动生成（自增）
    private Long id;  // 学生ID，唯一标识符

    @Column(unique = true, nullable = false)  // 列属性：唯一且不能为空
    private String studentNo;  // 学生学号，唯一且必填

    private String name;       // 学生姓名
    private String gender;     // 学生性别
    private LocalDate dob;     // 出生日期，使用LocalDate类型（映射为SQL日期）
    private String email;      // 邮箱地址
    private String phone;      // 电话号码
    private String address;    // 地址

    // 以下是所有字段的getter和setter方法，用于访问和修改私有字段
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}