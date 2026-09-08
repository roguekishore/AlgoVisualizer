package com.backend.springapp.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * CORS + HTTP client configuration.
 *
 * Set the ALLOWED_ORIGINS env var on EC2 to your CloudFront + frontend URLs:
 *   ALLOWED_ORIGINS=https://d1234abcd.cloudfront.net,https://yourdomain.com
 */
@Configuration
public class WebConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,https://localhost:3000}")
    private String allowedOriginsRaw;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = Arrays.stream(allowedOriginsRaw.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .toArray(String[]::new);

                // Chrome extension sync - wide open (extension has no origin header)
                registry.addMapping("/api/sync/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");

                // All other API endpoints - restricted to configured origins
                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);

                // Actuator - allow health checks from anywhere
                registry.addMapping("/actuator/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET");
            }
        };
    }

    /**
     * Shared RestTemplate for internal service calls (e.g. Spring Boot → Judge).
     * Connect timeout: 5 s - fail fast if judge is unreachable.
     * Read timeout:   125 s - must exceed the judge's own worst case, otherwise
     *   this side aborts first and a legitimate slow submission surfaces as a
     *   generic I/O error instead of a Time Limit Exceeded verdict. The judge
     *   compiles once (up to 30 s) then runs each test case at a 5 s limit, and
     *   on Lambda a cold start adds several seconds on top; its own timeout is
     *   120 s (see judge/template.yaml), so this sits just above it.
     *   Tradeoff: a stuck submission holds a servlet thread for ~2 min. Fine at
     *   this traffic level; revisit if concurrency grows.
     */
    @Bean
    public RestTemplate judgeRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);     // 5 seconds
        factory.setReadTimeout(125_000);      // 125 seconds
        return new RestTemplate(factory);
    }
}
