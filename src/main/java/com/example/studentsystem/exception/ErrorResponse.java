package com.example.studentsystem.exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 统一错误响应格式：{ timestamp, status, error, message, path, errors }
 */
@Setter
@Getter
public class ErrorResponse {
    // getters & setters
    private String timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<String> errors;

    public ErrorResponse() { this.timestamp = LocalDateTime.now().toString(); }

    public ErrorResponse(int status, String error, String message, String path) {
        this();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public ErrorResponse(int status, String error, String message, String path, List<String> errors) {
        this(status, error, message, path);
        this.errors = errors;
    }

}
