package com.example.studentsystem.controller;

import com.example.studentsystem.dto.TodoItemDto;
import com.example.studentsystem.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 提供 RESTful API 端点用于管理用户的待办事项列表。
 * 支持创建、查询、删除和切换待办事项的完成状态等操作。
 * 所有操作都基于当前认证的用户身份。
 */
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    /** Todo 服务类，用于处理待办事项的业务逻辑 */
    private final TodoService todoService;

    /**
     * 构造函数，通过依赖注入初始化 TodoService
     * @param todoService Todo 业务服务实例
     */
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    /**
     * 获取当前用户的所有待办事项列表
     * @param authentication 当前用户的认证信息
     * @return 该用户的所有待办事项列表
     */
    @GetMapping
    public List<TodoItemDto> list(Authentication authentication) {
        String username = authentication.getName();
        return todoService.listForUser(username);
    }

    /**
     * 创建待办事项请求记录
     * @param text 待办事项的文本内容
     */
    public record CreateTodoRequest(String text) {}

    /**
     * 创建新的待办事项
     * @param req 创建待办事项请求，包含待办事项的文本内容
     * @param authentication 当前用户的认证信息
     * @return 返回创建成功的待办事项信息，如果请求参数无效则返回 400 Bad Request
     */
    @PostMapping
    public ResponseEntity<TodoItemDto> create(@RequestBody CreateTodoRequest req,
                                              Authentication authentication) {
        // 验证请求参数，文本内容不能为空或只包含空白符
        if (req == null || req.text() == null || req.text().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String username = authentication.getName();
        TodoItemDto dto = todoService.addForUser(username, req.text().trim());
        return ResponseEntity.ok(dto);
    }

    /**
     * 删除指定的待办事项
     * @param id 待办事项的唯一标识
     * @param authentication 当前用户的认证信息
     * @return 删除成功返回 204 No Content 响应
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        todoService.deleteForUser(username, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 切换待办事项的完成状态
     * 若待办事项未完成，则标记为已完成；若已完成，则标记为未完成。
     * @param id 待办事项的唯一标识
     * @param authentication 当前用户的认证信息
     * @return 返回状态切换后的待办事项信息
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoItemDto> toggle(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        TodoItemDto dto = todoService.toggleDone(username, id);
        return ResponseEntity.ok(dto);
    }
}


