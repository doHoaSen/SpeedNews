package doHoaSen.SpeedNews.auth.domain;

import jakarta.persistence.*; import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_token")
@Getter @Setter @NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AppUser user;

    // Hibernate에게 JDBC 타입을 명시적으로 선언 (byte[]로 착각 방지)
    @Column(nullable = false, columnDefinition = "varchar(128)")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    private String tokenHash;

    @Column(nullable = false, columnDefinition = "varchar(64)")
    private String family;

    private boolean revoked = false;
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant expiresAt;
    private Instant lastUsedAt;

    public RefreshToken(AppUser u, String hash, String family, Instant exp) {
        this.user = u;
        this.tokenHash = hash;
        this.family = family;
        this.expiresAt = exp;
    }
}


