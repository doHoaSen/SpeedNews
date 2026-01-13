package doHoaSen.SpeedNews.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailVerificationRepo extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByToken(String token);

    @Query("SELECT e FROM EmailVerification e WHERE e.user = :user AND e.code = :code AND e.used = false ORDER BY e.createdAt DESC LIMIT 1")
    Optional<EmailVerification> findValidByUserAndCode(@Param("user") AppUser user, @Param("code") String code);


    // 특정 사용자 ID의 모든 미사용 인증 토큰 무효화 (used = true)
    @Modifying
    @Query("UPDATE EmailVerification e SET e.used = true WHERE e.user.id = :userId AND e.used = false")
    void invalidateAllByUser(@Param("userId") Long userId);
}
