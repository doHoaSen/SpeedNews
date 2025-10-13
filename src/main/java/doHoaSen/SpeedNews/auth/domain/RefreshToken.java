package doHoaSen.SpeedNews.auth;

import doHoaSen.SpeedNews.user.AppUser;
import jakarta.persistence.*; import lombok.*;
import java.time.Instant;

@Entity @Table(name="refresh_token") @Getter @Setter @NoArgsConstructor
public class RefreshToken {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private AppUser user;
    @Column(nullable=false) private String tokenHash;
    @Column(nullable=false) private String family;
    private boolean revoked=false;
    private Instant createdAt=Instant.now();
    @Column(nullable=false) private Instant expiresAt;
    private Instant lastUsedAt;

    public RefreshToken(AppUser u, String hash, String family, Instant exp) {
        this.user=u; this.tokenHash=hash; this.family=family; this.expiresAt=exp;
    }
}
