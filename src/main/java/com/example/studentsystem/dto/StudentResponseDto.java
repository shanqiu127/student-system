package com.example.studentsystem.dto;

import java.time.LocalDate;

    /*这是一个数据传输对象（DTO）类，用于封装学生响应数据，把持久化的学生数据返回给客户端（序列化为 JSON 等）。
    提供所有字段的标准getter和setter方法，用于序列化响应数据（如JSON）。
    无验证注解，因为它是响应对象，不需要输入验证；常用于从实体映射数据返回给客户端。
     */
public class StudentResponseDto {
    private Long id;
    private String studentNo;
    private String name;
    private String gender;
    private LocalDate dob;
    private String phone;  // 监护人手机号
    private String address;
    private String className;

    // getters & setters
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
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}