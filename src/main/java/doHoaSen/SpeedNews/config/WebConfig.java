package doHoaSen.SpeedNews.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
                .allowedOrigins(
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "http://localhost:5173",           // 로컬 개발용
                        "http://127.0.0.1:5173",           // 로컬 개발용
                        "https://speednews.it.kr",         // 최종 도메인
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");
    }
}