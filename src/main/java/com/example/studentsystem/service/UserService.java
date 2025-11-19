package com.example.studentsystem.service;

import com.example.studentsystem.model.Role;
import com.example.studentsystem.model.User;
import com.example.studentsystem.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("用户名已存在");
        }
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRoles(Set.of(Role.ROLE_USER));
        return userRepository.save(u);
    }

    public User loadUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
    }

    public void ensureAdminExists(String adminUser, String adminPass) {
        if (userRepository.findByUsername(adminUser).isEmpty()) {
            User admin = new User(adminUser, passwordEncoder.encode(adminPass), Set.of(Role.ROLE_ADMIN));
            userRepository.save(admin);
        }
    }
}
