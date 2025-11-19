package com.example.studentsystem.exception;

/**
 * service层抛出表示资源已存在（例如学号冲突）
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException() { super(); }
    public DuplicateResourceException(String message) { super(message); }
    public DuplicateResourceException(String message, Throwable cause) { super(message, cause); }
}
