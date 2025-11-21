package com.example.studentsystem.security;

import com.example.studentsystem.security.jwt.JwtAuthenticationFilter;
import com.example.studentsystem.service.UserService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;

/*
 * SecurityConfig.java
 * -  Spring 的配置类，用来集中定义应用的安全策略（认证、授权、过滤器链等）。
 * - 使用 @EnableMethodSecurity 开启方法级别的安全注解。
 * - 在运行时 Spring 会加载这个配置并构建 SecurityFilterChain 等 bean。
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // 注入自定义的 JWT 认证过滤器（实现了 OncePerRequestFilter）
    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /*
     * userDetailsService 方法：
     * - 将项目的 UserService 适配为 Spring Security 所需的 UserDetailsService。
     * - 返回一个函数式实现：userService::loadUserByUsername。
     * - 避免构造器注入时产生循环依赖（UserService 可能依赖 PasswordEncoder 等）。
     * - 注册为 Bean 后，Spring Security 可以在需要时通过类型注入该 UserDetailsService。
     */
    @Bean
    public UserDetailsService userDetailsService(UserService userService) {
        return userService::loadUserByUsername;
    }


    // authenticationProvider 方法：
    // - 定义认证提供者（AuthenticationProvider）Bean。
    // - 使用 DaoAuthenticationProvider，结合 UserDetailsService 和 PasswordEncoder 进行认证。
    // - 注册为 Bean 后，Spring Security 在认证时会使用此提供者。
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
                                                         PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
    /*
     * authenticationManager 方法：
        * - 定义认证管理器（AuthenticationManager）Bean。
        * - 使用传入的 AuthenticationProvider（DaoAuthenticationProvider）来处理认证逻辑。
        * - ProviderManager 是 AuthenticationManager 的一个实现，支持多个 AuthenticationProvider。
        * - 注册为 Bean 后，Spring Security 在需要认证时会使用此管理器
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    /*
     * filterChain 方法：
     * - 定义 HTTP 请求的安全策略和过滤链（SecurityFilterChain）。
     * - 关闭 CSRF（因为使用 JWT，通常在无状态 REST API 场景下会禁用 CSRF）。
     * - 配置不需要认证的路径（例如登录/注册接口、H2 控制台、Swagger 文档接口）。
     * - 其它请求要求已认证。
     * - 将自定义的 JwtAuthenticationFilter 插入到 UsernamePasswordAuthenticationFilter 之前，
     *   这样在请求到达 UsernamePasswordAuthenticationFilter（处理基于表单的认证）之前就能解析并校验 JWT。
     * - 允许 iframe 来自同源（frameOptions.sameOrigin），以便 H2 控制台能在浏览器中嵌入显示。
     *
     * 细节说明：
     * - .csrf(AbstractHttpConfigurer::disable)：禁用 CSRF保护（仅在合适场景下禁用）。
     * - .authorizeHttpRequests(...)：配置基于请求路径的授权规则。
     * - .addFilterBefore(... )：控制自定义过滤器在过滤器链中的位置。
     * - 返回 http.build()，Spring 会根据此配置创建最终的 SecurityFilterChain 对象。
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                //确保启用 CORS 支持
                .cors(Customizer.withDefaults())
                // 关闭 CSRF（REST + JWT 场景常见设置）
                .csrf(AbstractHttpConfigurer::disable)
                // 基于请求路径进行授权配置
                .authorizeHttpRequests(authorize -> authorize
                        // 公开
                        .requestMatchers("/api/auth/**", "/h2-console/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // 其他认证
                        .anyRequest().authenticated()
                )
                // 加入自定义的 JWT 认证过滤器
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // 允许同源 iframe（H2 控制台需要）
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
        return http.build();
    }
}
