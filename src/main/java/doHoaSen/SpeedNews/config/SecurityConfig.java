
package doHoaSen.SpeedNews.config;

import doHoaSen.SpeedNews.auth.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filter(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(reg -> reg
                        // actuator
                        .requestMatchers("/actuator/**", "/api/actuator/**").permitAll()

                        // 회원가입/로그인/이메일 인증/비밀번호 관련 API
                        .requestMatchers(
                                "/auth/**",
                                "/api/auth/**"
                        ).permitAll()

                        // 프론트엔드 정적 파일 & 라우트 페이지 허용
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico",
                                "/static/**", "/assets/**",
                                "/manifest.json", "/logo192.png", "/logo512.png",
                                "/reset-password/**", "/verify-email/**",
                                "/*.js", "/*.css"
                        ).permitAll()

                        // 뉴스 스트림 공개
                        .requestMatchers("/news/**", "/stream/**", "/api/news/**", "/api/stream/**").permitAll()

                        // 관리자 전용
                        .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")

                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
