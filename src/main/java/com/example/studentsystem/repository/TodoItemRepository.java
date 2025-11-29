package com.example.studentsystem.repository;

import com.example.studentsystem.model.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
// 待办事项仓库接口,根据用户名查询待办事项
public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByUserUsernameOrderByCreatedAtDesc(String username);
}


