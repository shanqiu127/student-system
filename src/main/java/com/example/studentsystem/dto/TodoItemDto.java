package com.example.studentsystem.dto;

import java.time.Instant;

/**
 * 仪表盘待办事项 DTO，用于前端展示。
 */
public record TodoItemDto(Long id, String text, boolean done, Instant createdAt) {
}


