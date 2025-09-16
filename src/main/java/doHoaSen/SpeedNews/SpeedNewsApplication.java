package doHoaSen.SpeedNews;

import doHoaSen.SpeedNews.config.NewsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(NewsProperties.class) // ✅ 필수
public class SpeedNewsApplication {
	public static void main(String[] args) {
		SpringApplication.run(SpeedNewsApplication.class, args);
	}
}