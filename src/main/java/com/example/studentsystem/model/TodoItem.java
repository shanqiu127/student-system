package com.example.studentsystem.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Entity
@Table(name = "user_todos")
public class TodoItem {
    @Id
    // 主键自增
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false,length = 1024)
    private String text;

    @Setter
    @Column(nullable = false)
    // 完成状态
    private boolean done = false;

    @Setter
    @Column(nullable = false, updatable = false)
    // 创建时间
    private Instant createdAt = Instant.now();

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public TodoItem() {
    }

    public TodoItem(String text, User user) {
        this.text = text;
        this.user = user;
    }

}


