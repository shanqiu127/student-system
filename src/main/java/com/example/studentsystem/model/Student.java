package com.example.studentsystem.model;

import jakarta.persistence.*;  // 导入JPA注解
// 导入Lombok注解,简化类的getter和setter方法
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;   // 导入LocalDate类，用于处理日期
//可以看成为表结构的 Java 描述 + 提供字段访问/设置的 POJO（普通java对象，用于使用数据库的数据表）
@Setter
@Getter
@Entity  // 标记此类为JPA实体，表示它映射到数据库表
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_no", "user_id"})  // 学号在同一用户内唯一
})  // 指定映射的数据库表名为students
public class Student {
    // 以下是所有字段的getter和setter方法，用于访问和修改私有字段
    @Id  // 标记为主键字段
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 主键值由数据库自动生成（自增）
    private Long id;  // 学生ID，唯一标识符

    @Column(name = "student_no", nullable = false)  // 列属性：不能为空，在用户内唯一
    private String studentNo;  // 学生学号，必填

    @ManyToOne(fetch = FetchType.LAZY)  // 多对一关联，延迟加载
    @JoinColumn(name = "user_id", nullable = false)  // 外键列名，不能为空
    private User user;  // 所属用户

    private String name;       // 学生姓名
    private String gender;     // 学生性别
    private LocalDate dob;     // 出生日期，使用LocalDate类型（映射为SQL日期）
    private String phone;      // 监护人手机号
    private String address;    // 地址
    private String className;  // 班级

}