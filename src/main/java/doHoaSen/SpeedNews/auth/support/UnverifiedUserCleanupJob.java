package doHoaSen.SpeedNews.auth.support;

import doHoaSen.SpeedNews.auth.domain.AppUser;
import doHoaSen.SpeedNews.auth.domain.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UnverifiedUserCleanupJob {

    private final UserRepo users;

    @Scheduled(fixedRate = 3600000) // 매 1시간마다
    @Transactional
    public void cleanupExpiredUnverifiedUsers() {
        Instant cutoff = Instant.now().minus(Duration.ofHours(48));
        List<AppUser> expired = users.findByEmailVerifiedFalseAndCreatedAtBefore(cutoff);

        if (!expired.isEmpty()) {
            users.deleteAll(expired);
            System.out.println("🧹 Deleted " + expired.size() + " expired unverified users.");
        }
    }
}
