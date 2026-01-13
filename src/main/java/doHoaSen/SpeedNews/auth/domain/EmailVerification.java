package doHoaSen.SpeedNews.auth.domain;

import doHoaSen.SpeedNews.auth.domain.AppUser;
import jakarta.mail.MailSessionDefinition;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="email_verification")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailVerification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    private AppUser user;

    @Column(nullable=false, unique=true)
    private String token;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable=false)
    private Instant expiresAt;

    @Column(nullable=false)
    private boolean used = false;

    @Column(nullable=false)
    private Instant createdAt = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    private boolean verified = false; // 인증 완료 여부


    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public EmailVerification(AppUser user, String token, String code, Instant expiresAt) {
        this.user = user;
        this.token = token;
        this.code = code;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

}
