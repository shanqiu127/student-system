package com.example.studentsystem.security.jwt;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.example.studentsystem.service.UserService;

import java.io.IOException;

/**
 * JwtAuthenticationFilter
 *
 * 作用概述：
 * - 这是一个基于 JWT 的认证过滤器，每次 HTTP 请求都会执行一次。
 * - 从请求头中解析 `Authorization: Bearer <token>`，提取用户名并验证 token。
 * - 验证通过后将一个已认证的 Authentication 放入 SecurityContext，以便后续的授权检查可以使用。
 *
 * 设计要点与安全说明：
 * - 继承 OncePerRequestFilter 确保每个请求只执行一次过滤逻辑，适合做认证/鉴权处理。
 * - 仅在 SecurityContext 中尚未有 Authentication 的情况下进行解析与设置，避免覆盖已有认证（例如 session 登陆）。
 * - 如果把 JWT 存在 Cookie 并自动发送，会产生 CSRF 风险，本过滤器JWT 在 Authorization 头中传递。
 * - 对外部异常（如解析失败）应当安静处理并放行到下一个过滤器，由后续的安全链决定是否拒绝（通常会因无认证而返回 401）。
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // 负责 JWT 的生成/解析/校验逻辑（自定义服务）
    private final JwtService jwtService;
    // 用于根据用户名加载用户信息（实现 UserDetailsService）
    private final UserService userService;

    public JwtAuthenticationFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    /**
     * doFilterInternal
     * 核心流程（按顺序）：
     * 1. 从请求头获取 Authorization 字段，检查是否以 "Bearer " 开头。
     * 2. 提取 token 并尝试解析得到用户名（extractUsername 可能在解析失败时抛出异常）。
     * 3. 如果解析出用户名，并且当前 SecurityContext 尚未包含 Authentication：
     *    - 通过 UserService 加载 UserDetails（包含权限信息）。
     *    - 使用 JwtService 验证 token 的有效性（例如签名、过期、载荷对比等）。
     *    - 验证通过后，创建 UsernamePasswordAuthenticationToken 并设置到 SecurityContext 中。
     * 4. 调用 filterChain.doFilter 将请求交给下一个过滤器或最终的资源处理器。
     *
     * 异常与容错：
     * - 对 token 解析异常使用 try/catch 抑制，避免在过滤器中暴露内部异常细节。
     * - 如果 token 无效或用户不存在，则不会设置 Authentication，后续 Spring Security 会根据配置拒绝访问或返回匿名。
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        // 从请求头读取 Authorization
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String token = null;

        // 检查是否符合 "Bearer <token>" 格式
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // 提取 token（跳过 "Bearer " 前缀）
            token = authHeader.substring(7);
            try {
                // 从 token 中提取用户名（可能抛出解析异常，例如签名错误或格式错误）
                username = jwtService.extractUsername(token);
            } catch (Exception ignored) {
                // 解析失败则忽略异常，不在此处抛出，后续因无认证会被拒绝
                // 注意：记录日志在生产环境中是必要的（此处为简洁未加日志）
            }
        }

        // 没有认证信息尝试校验并设置认证
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 通过 UserService 加载用户详情（通常包含账号是否启用、权限列表等）
            UserDetails userDetails = userService.loadUserByUsername(username);

            // 用户存在&& token 校验成功时才认为认证通过
            if (userDetails != null && jwtService.validateToken(token)) {
                // 创建已认证的 Authentication 对象，第三个参数为授权列表（authorities）
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                // 设置详情信息（包括远端地址、session id 等），有助于后续审计或细粒度策略
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // 将认证结果放入 SecurityContext，后续请求处理和 @PreAuthorize 等会基于该认证进行授权判断
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 无论是否设置了认证，都必须继续过滤链（否则请求会被中断）
        filterChain.doFilter(request, response);
    }
}
