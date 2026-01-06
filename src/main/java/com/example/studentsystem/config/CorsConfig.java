package com.example.studentsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

/**
 * 开发时允许前端 (http://localhost:3000) 发起跨域请求。
 * 生产环境请收紧 origin 列表或使用环境变量控制。
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 开发时允许 localhost:3000 前端 origin。你也可以增加 127.0.0.1:3000，或用通配符（开发用）。
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        // 允许常用方法
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 允许所有请求头（开发时）
        config.setAllowedHeaders(List.of("*"));
        // 如果需要跨域携带 cookie/凭证，设置 true（但不要与 AllowedOrigins="*" 一起使用）
        config.setAllowCredentials(true);
        // 可选：设置暴露给前端的响应头
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}