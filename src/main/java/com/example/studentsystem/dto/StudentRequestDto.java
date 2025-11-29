package com.example.studentsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
    /*
    学生请求数据传输对象（DTO）类
    包含学生的基本信息字段，并使用注解进行数据验证
    包括学号、姓名、性别、出生日期、监护人手机号等
    提供getter和setter方法以访问和修改字段值
     */
public class StudentRequestDto {  // 数据传输对象（DTO），用于接收和验证学生请求数据
    @NotBlank(message = "学号不能为空")
    @Size(max = 50)  // 验证学号最大长度为50字符
    private String studentNo;  // 学生学号

    @NotBlank(message = "姓名不能为空")  // 验证姓名不能为空
    @Size(max = 100)  // 验证姓名最大长度为100字符
    private String name;  // 学生姓名

    private String gender;  // 学生性别（无验证约束）

    @Past(message = "出生日期必须是过去的日期")  // 验证出生日期必须是过去的日期
    private LocalDate dob;  // 出生日期

    // 监护人手机号（11 位，以 1 开头）
    @jakarta.validation.constraints.Pattern(
            regexp = "^1\\d{10}$",
            message = "监护人手机号必须是以1开头的11位数字"
    )
    private String phone;

    private String address;  // ：地址

    //班级字段，限制最大长度
    @Size(max = 100)
    private String className;  // 班级名称

    // 以下是所有字段的getter和setter方法，用于访问和修改私有字段
    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}