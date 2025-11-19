package com.example.studentsystem.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    private Key key;
    private final String secret;
    private final long jwtExpirationMs;

    public JwtService(@Value("${app.jwt.secret:}") String secret,
                      @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs) {
        this.secret = Optional.ofNullable(secret).orElse("").trim();
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @PostConstruct
    private void initKey() {
        try {
            if (secret.isEmpty()) {
                logger.warn("app.jwt.secret is empty — generating ephemeral signing key (development only). " +
                        "Set a strong app.jwt.secret in application properties or env for production.");
                this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            } else {
                byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
                this.key = Keys.hmacShaKeyFor(keyBytes);
            }
            logger.info("JWT signing key initialized (key algorithm: {})", key.getAlgorithm());
        } catch (IllegalArgumentException | WeakKeyException ex) {
            logger.error("Provided app.jwt.secret is invalid for HS256: {}. Generating ephemeral key for startup. " +
                    "Please set a proper secret of at least 32 bytes (or use a base64-encoded 32+ byte value).", ex.getMessage());
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } catch (Exception ex) {
            logger.error("Unexpected error initializing JWT key - generating ephemeral key. Error: ", ex);
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            logger.debug("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }
}