package com.example.studentsystem.mapper;

import com.example.studentsystem.model.Student;
import com.example.studentsystem.dto.StudentRequestDto;
import com.example.studentsystem.dto.StudentResponseDto;
//这是一个映射器类，用于在Student实体和DTO（StudentRequestDto、StudentResponseDto）之间转换数据，避免直接暴露实体。
//toEntity(dto)：将请求DTO转换为新Student实体，设置所有字段。
//toDto(s)：将Student实体转换为响应DTO，包含ID和所有字段。
//updateEntityFromDto(dto, s)：使用DTO更新现有Student实体，覆盖所有字段。
//所有方法都处理null值以提高健壮性，常用于控制器中数据转换。
public class StudentMapper {

    public static Student toEntity(StudentRequestDto dto) {
        if (dto == null) return null;
        Student s = new Student();
        s.setStudentNo(dto.getStudentNo());
        s.setName(dto.getName());
        s.setGender(dto.getGender());
        s.setDob(dto.getDob());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        return s;
    }

    public static StudentResponseDto toDto(Student s) {
        if (s == null) return null;
        StudentResponseDto dto = new StudentResponseDto();
        dto.setId(s.getId());
        dto.setStudentNo(s.getStudentNo());
        dto.setName(s.getName());
        dto.setGender(s.getGender());
        dto.setDob(s.getDob());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        return dto;
    }

    public static void updateEntityFromDto(StudentRequestDto dto, Student s) {
        if (dto == null || s == null) return;
        s.setStudentNo(dto.getStudentNo());
        s.setName(dto.getName());
        s.setGender(dto.getGender());
        s.setDob(dto.getDob());
        s.setEmail(dto.getEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
    }
}