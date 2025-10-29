package doHoaSen.SpeedNews.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.List;

public interface UserRepo extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    // 48시간 지난 미인증 사용자 검색용
    List<AppUser> findByEmailVerifiedFalseAndCreatedAtBefore(Instant cutoff);
}
