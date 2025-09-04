package doHoaSen.SpeedNews.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "https://fantastic-kashata-d47d49.netlify.app",
                        "https://fantastic-kashata-d47d49--develop.netlify.app", // 브랜치 프리뷰
                        "https://speednews.it.kr",
                        "https://www.speednews.it.kr"
                )
                .allowedMethods("*");
    }
}