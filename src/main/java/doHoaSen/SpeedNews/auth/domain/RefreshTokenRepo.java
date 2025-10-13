package doHoaSen.SpeedNews.auth;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {

    // DB에 저장된 해시값으로 RefreshToken 찾기
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // family 단위로 리프레시 토큰 회전 시 모두 폐기
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.family = :family")
    void revokeFamily(@Param("family") String family);
}
