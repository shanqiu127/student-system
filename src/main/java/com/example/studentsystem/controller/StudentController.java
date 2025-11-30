package com.example.studentsystem.controller;

import com.example.studentsystem.dto.StudentRequestDto;  // 导入请求DTO，用于接收学生数据
import com.example.studentsystem.dto.StudentResponseDto;  // 导入响应DTO，用于返回学生数据
import com.example.studentsystem.service.StudentService;  // 导入服务接口，用于业务逻辑
import org.springframework.data.domain.Page;  // 导入Page类，用于分页结果
import org.springframework.data.domain.Pageable;  // 导入Pageable接口，用于分页参数
import org.springframework.http.ResponseEntity;  // 导入ResponseEntity，用于构建HTTP响应
import org.springframework.web.bind.annotation.*;  // 导入Spring Web注解，用于REST API
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import jakarta.validation.Valid;  // 导入Valid注解，用于验证请求体

@RestController  // 标记此类为REST控制器，提供REST API
@RequestMapping("/api/students")  // 指定基础请求路径为/api/students
public class StudentController {

    private final StudentService service;  // 声明StudentService依赖，用于业务逻辑操作

    // 构造器注入StudentService
    public StudentController(StudentService service) {
        this.service = service;
    }
    // 定义分页响应记录，包含内容、总元素数、总页数和当前页码
    public record PagedResponse<T>(List<T> content, long totalElements, int totalPages, int pageNumber) {}
    @GetMapping
    // 处理GET请求，列出学生，支持分页和过滤
    public PagedResponse<StudentResponseDto> list(
            @RequestParam(required = false) String studentNo,
            Pageable pageable) {
        Page<StudentResponseDto> page = service.list(pageable, studentNo);
        // 自定义返回分页数据结构
        return new PagedResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber()
        );
    }

    @GetMapping("/{id}")  // 处理GET请求，根据ID获取单个学生
    public ResponseEntity<StudentResponseDto> get(@PathVariable Long id) {
        // 调用服务层获取学生，若存在返回200 OK，否则返回404 Not Found
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping  // 处理POST请求，创建新学生
    public ResponseEntity<StudentResponseDto> create(@Valid @RequestBody StudentRequestDto dto) {
        // 使用@Valid验证请求体，调用服务层创建学生，返回201 Created
        StudentResponseDto created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")  // 处理PUT请求，更新现有学生
    public ResponseEntity<StudentResponseDto> update(@PathVariable Long id, @Valid @RequestBody StudentRequestDto dto) {
        // 使用@Valid验证请求体，调用服务层更新学生，若成功返回200 OK，否则返回404 Not Found
        return service.update(id, dto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")  // 处理DELETE请求，删除学生
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // 调用服务层删除学生，若不存在返回404 Not Found，否则返回204 No Content
        if (!service.delete(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch")  // 处理DELETE请求，批量删除学生
    public ResponseEntity<String> batchDelete(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body("删除列表不能为空");
        }
        int deleted = 0;
        // 遍历ID列表，逐个删除
        for (Long id : ids) {
            if (service.delete(id)) {
                deleted++;
            }
        }
        return ResponseEntity.ok("成功删除 " + deleted + " 条学生记录");
    }
    // 处理POST请求，支持Excel一键导入学生数据
    @PostMapping("/import")
    public ResponseEntity<String> importStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("文件不能为空");
        }
        try (InputStream in = file.getInputStream(); Workbook workbook = WorkbookFactory.create(in)) {
            Sheet sheet = workbook.getSheetAt(0);
            int imported = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // 从第2行开始，跳过表头
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                // 读取所有字段：姓名、学号、性别、出生日期、班级、监护人手机号、地址
                Cell nameCell = row.getCell(0);      // 第1列：姓名
                Cell noCell = row.getCell(1);        // 第2列：学号
                Cell genderCell = row.getCell(2);    // 第3列：性别
                Cell dobCell = row.getCell(3);       // 第4列：出生日期
                Cell classCell = row.getCell(4);     // 第5列：班级
                Cell phoneCell = row.getCell(5);     // 第6列：监护人手机号
                Cell addressCell = row.getCell(6);   // 第7列：地址
                
                if (nameCell == null && noCell == null) continue;

                StudentRequestDto dto = new StudentRequestDto();
                dto.setName(getStringCell(nameCell));
                dto.setStudentNo(getStringCell(noCell));
                dto.setGender(getStringCell(genderCell));        // 性别
                
                // 解析出生日期（yyyy-MM-dd 格式）
                String dobStr = getStringCell(dobCell);
                if (dobStr != null && !dobStr.isBlank()) {
                    try {
                        dto.setDob(LocalDate.parse(dobStr, DateTimeFormatter.ISO_LOCAL_DATE));
                    } catch (Exception e) {
                        // 日期格式错误，忽略
                    }
                }
                
                dto.setClassName(getStringCell(classCell));      // 班级
                dto.setPhone(getStringCell(phoneCell));          // 监护人手机号
                dto.setAddress(getStringCell(addressCell));      // 地址
                
                if (dto.getStudentNo() == null || dto.getStudentNo().isBlank()) {
                    continue; // 学号必填
                }
                service.create(dto);
                imported++;
            }
            return ResponseEntity.ok("成功导入 " + imported + " 条学生记录");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("导入失败: " + e.getMessage());
        }
    }
    // 处理GET请求，下载Excel导入模板
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = WorkbookFactory.create(true)) { // true -> XSSF (.xlsx)
            Sheet sheet = workbook.createSheet("Students");
            //第1行：表头
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("姓名");
            header.createCell(1).setCellValue("学号");
            header.createCell(2).setCellValue("性别");
            header.createCell(3).setCellValue("出生日期");
            header.createCell(4).setCellValue("班级");
            header.createCell(5).setCellValue("监护人手机号");
            header.createCell(6).setCellValue("地址");
            
            //第2行：给出示例数据
            Row example = sheet.createRow(1);
            example.createCell(0).setCellValue("张三");
            example.createCell(1).setCellValue("2025001");
            example.createCell(2).setCellValue("男");
            example.createCell(3).setCellValue("2005-06-15");
            example.createCell(4).setCellValue("高一1班");
            example.createCell(5).setCellValue("13800001111");
            example.createCell(6).setCellValue("北京市朝阳区");
            
            for (int i = 0; i <= 6; i++) {
                sheet.autoSizeColumn(i);
            }

            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            workbook.write(bos);
            byte[] bytes = bos.toByteArray();
            // 设置响应头，提示下载文件
            String fileName = URLEncoder.encode("student-import-template.xlsx", StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            // 设置内容类型为Excel文件
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentLength(bytes.length);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);

            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    // 辅助方法：获取单元格字符串值，处理不同类型的单元格
    private static String getStringCell(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue().trim();
        if (cell.getCellType() == CellType.NUMERIC) {
            double v = cell.getNumericCellValue();
            long lv = (long) v;
            if (Math.abs(v - lv) < 1e-6) {
                return String.valueOf(lv);
            }
            return String.valueOf(v);
        }
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }
}