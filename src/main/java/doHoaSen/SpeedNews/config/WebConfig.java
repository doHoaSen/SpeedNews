package doHoaSen.SpeedNews.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry reg) {
        // 1) 기존 /api/** 그대로 유지
        reg.addMapping("/api/**")
                .allowedOrigins(
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");

        // 2) 추가: /auth/**, /news/**, /stream/** 도 허용
        reg.addMapping("/auth/**")
                .allowedOrigins(
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");

        reg.addMapping("/news/**")
                .allowedOrigins(
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");

        reg.addMapping("/stream/**")
                .allowedOrigins(
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "https://develop--fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",
                        "https://fantastic-kashata-d47d49.netlify.app",            // 프로덕션(네틀리파이 서브도메인)
                        "https://develop--fantastic-kashata-d47d49.netlify.app",   // 브랜치 배포(정답)
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");
    }
}
