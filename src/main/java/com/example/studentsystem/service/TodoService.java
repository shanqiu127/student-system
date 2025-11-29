package com.example.studentsystem.service;

import com.example.studentsystem.dto.TodoItemDto;
import com.example.studentsystem.model.TodoItem;
import com.example.studentsystem.model.User;
import com.example.studentsystem.repository.TodoItemRepository;
import com.example.studentsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TodoService {

    private final TodoItemRepository todoRepository;
    private final UserRepository userRepository;

    public TodoService(TodoItemRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }
    // 加载用户
    private User loadUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("用户不存在: " + username));
    }
    // 转换成 DTO
    private static TodoItemDto toDto(TodoItem entity) {
        return new TodoItemDto(entity.getId(), entity.getText(), entity.isDone(), entity.getCreatedAt());
    }
    // 列出用户待办
    @Transactional(readOnly = true)
    public List<TodoItemDto> listForUser(String username) {
        return todoRepository.findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(TodoService::toDto)
                .toList();
    }
    // 添加用户待办
    @Transactional
    public TodoItemDto addForUser(String username, String text) {
        User user = loadUser(username);
        TodoItem item = new TodoItem(text, user);
        return toDto(todoRepository.save(item));
    }
    // 删除用户待办
    @Transactional
    public void deleteForUser(String username, Long id) {
        todoRepository.findById(id).ifPresent(item -> {
            if (item.getUser().getUsername().equals(username)) {
                todoRepository.delete(item);
            }
        });
    }
    // 切换待办完成状态
    @Transactional
    public TodoItemDto toggleDone(String username, Long id) {
        TodoItem item = todoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("待办不存在"));
        if (!item.getUser().getUsername().equals(username)) {
            throw new SecurityException("无权操作该待办");
        }
        item.setDone(!item.isDone());
        TodoItem saved = todoRepository.save(item); // 保存到数据库
        return toDto(saved);
    }
}


