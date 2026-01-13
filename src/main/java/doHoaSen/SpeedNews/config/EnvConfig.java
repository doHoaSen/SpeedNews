package doHoaSen.SpeedNews.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {
    public static final Dotenv DOTENV = Dotenv.configure()
            .ignoreIfMissing()
            .load();

    public static String get(String key) {
        return DOTENV.get(key);
    }
}
