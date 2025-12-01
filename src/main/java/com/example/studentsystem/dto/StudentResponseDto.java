package com.example.studentsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

    /*这是一个数据传输对象（DTO）类，用于封装学生响应数据，把持久化的学生数据返回给客户端（序列化为 JSON 等）。
    提供所有字段的标准getter和setter方法，用于序列化响应数据（如JSON）。
    无验证注解，因为它是响应对象，不需要输入验证；常用于从实体映射数据返回给客户端。
     */
@Setter
@Getter
public class StudentResponseDto {
    private Long id;
    private String studentNo;
    private String name;
    private String gender;
    private LocalDate dob;
    private String phone;  // 监护人手机号
    private String address;
    private String className;

    }