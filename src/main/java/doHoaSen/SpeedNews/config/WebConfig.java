package doHoaSen.SpeedNews.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "https://fantastic-kashata-d47d49.netlify.app",            // 프로덕션(네틀리파이 서브도메인)
                        "https://develop--fantastic-kashata-d47d49.netlify.app",   // 브랜치 배포(정답)
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");
    }
}