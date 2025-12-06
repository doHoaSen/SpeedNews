package doHoaSen.SpeedNews.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * staging / prod 환경에서는 실제 메일을 보내지 않기 때문에
 * JavaMailSender Bean만 더미로 등록하여 구동 오류를 방지한다.
 */
@Configuration
@Profile({"staging", "prod"})
public class DummyMailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        // 빈 구현체만 리턴 → 실제 메일 전송 기능 없음
        System.out.println("[INFO] Using Dummy JavaMailSender (staging/prod)");
        return new JavaMailSenderImpl();
    }
}
