package doHoaSen.SpeedNews.auth.service;

import doHoaSen.SpeedNews.auth.domain.*;
import doHoaSen.SpeedNews.auth.dto.AuthDtos.*;
import doHoaSen.SpeedNews.auth.event.SendVerificationEmailEvent;
import doHoaSen.SpeedNews.auth.security.JwtService;
import doHoaSen.SpeedNews.auth.support.Passwords;
import doHoaSen.SpeedNews.auth.support.PwPolicy;
import doHoaSen.SpeedNews.common.util.Hash;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.server.ResponseStatusException;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepo users;
    private final RoleRepo roles;
    private final RefreshTokenRepo refreshes;
    private final JwtService jwt;
    private final EmailVerificationService emailService;
    private final ApplicationEventPublisher eventPublisher;

    /** 회원가입 */
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void register(RegisterReq req) {
        if (!PwPolicy.isStrong(req.password()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weak password");

        var email = req.email().toLowerCase();
        var existing = users.findByEmail(email);

        if (existing.isPresent()) {
            var user = existing.get();

            // 이미 인증된 유저라면 중복가입 불가
            if (user.isEmailVerified()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 인증된 이메일입니다.");
            }

            // 인증 안 된 유저: 48시간 이내면 재인증 메일 재발송
            Duration sinceCreated = Duration.between(user.getCreatedAt(), Instant.now());
            if (sinceCreated.toHours() < 48) {
                emailService.resendVerificationMail(user);
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "아직 인증되지 않은 이메일입니다. 새 인증 메일을 발송했습니다.");
            } else {
                // 48시간 경과 시 삭제 후 재가입 허용
                users.delete(user);
            }
        }

        // 신규 유저 생성
        var user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(Passwords.hash(req.password()));
        user.setName(req.name());
        user.setEmailVerified(false);
        user.setEnabled(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user.getRoles().add(roles.findByName("ROLE_USER").orElseThrow());

        // 즉시 INSERT 및 flush (FK 문제 해결의 핵심)
        users.saveAndFlush(user);
        // 트랜잭션 커밋 후 이메일 발송 이벤트 발행
        eventPublisher.publishEvent(new SendVerificationEmailEvent(user.getId()));


        System.out.println("📧 이메일 인증 발송 이벤트 등록됨: " + user.getEmail());

    }

    public void deleteAccount(Long uid, String password) {
        var user = users.findById(uid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // 비밀번호 검증
        if (!Passwords.verify(password, user.getPasswordHash())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호가 일치하지 않습니다.");
        }

        // refresh 토큰 삭제
        refreshes.deleteAllByUserId(uid);

        users.delete(user);

        System.out.println("사용자 탈퇴 완료: " + user.getEmail());
    }

    @Component
    @RequiredArgsConstructor
    public class SendVerificationEmailListener {

        private final EmailVerificationService emailVerificationService;
        private final UserRepo users;

        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handle(SendVerificationEmailEvent event) {
            var user = users.findById(event.userId()).orElseThrow();
            emailVerificationService.sendVerificationMail(user);
        }
    }

    /** 재인증 요청 */
    @Transactional
    public void resendVerification(String email) {
        var user = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "가입되지 않은 이메일입니다."));

        if (user.isEmailVerified())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 인증된 이메일입니다.");

        emailService.resendVerificationMail(user);
    }

    /** 로그인 */
    public TokenRes login(LoginReq req) {
        var u = users.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (!u.isEmailVerified())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이메일 인증이 필요합니다.");

        if (!Passwords.verify(u.getPasswordHash(), req.password()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

        String family = UUID.randomUUID().toString().replace("-", "");
        String access = jwt.createAccess(u.getId(), u.getRoles().stream().map(Role::getName).toList());
        String refresh = jwt.createRefresh(u.getId(), family);
        refreshes.save(new RefreshToken(u, Hash.sha256(refresh), family, Instant.now().plus(Duration.ofDays(14))));

        return new TokenRes(access, refresh);
    }

    /** 토큰 재발급 */
    @Transactional
    public TokenRes refresh(RefreshReq req) {
        var dec = jwt.verify(req.refreshToken());
        if (!"refresh".equals(dec.getClaim("typ").asString()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        Long uid = Long.valueOf(dec.getSubject());
        String family = dec.getClaim("family").asString();

        var inDb = refreshes.findByTokenHash(Hash.sha256(req.refreshToken()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (inDb.isRevoked() || inDb.getExpiresAt().isBefore(Instant.now()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

        refreshes.revokeFamily(family);

        var u = users.findById(uid).orElseThrow();
        String access = jwt.createAccess(uid, u.getRoles().stream().map(Role::getName).toList());
        String newRefresh = jwt.createRefresh(uid, family);
        refreshes.save(new RefreshToken(u, Hash.sha256(newRefresh), family, Instant.now().plus(Duration.ofDays(14))));
        return new TokenRes(access, newRefresh);
    }

    public MeRes me(Long uid) {
        var u = users.findById(uid).orElseThrow();
        return new MeRes(u.getId(), u.getEmail(), u.isEmailVerified(),
                u.getRoles().stream().map(Role::getName).toList());
    }


    @Transactional
    public void sendPasswordResetMail(String email) {
        var user = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "등록되지 않은 이메일입니다."));

        String token = jwt.createEmailToken(email); // ✅ 30분짜리 토큰 생성
        String link = "http://localhost:8080/api/auth/verify-reset-pw?token=" + token;

        String html = """
  <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;">
    <h2 style="color:#2B6CB0;">SpeedNews 비밀번호 재설정</h2>
    <p>안녕하세요, %s 님!</p>
    <p>아래 버튼을 눌러 비밀번호를 재설정해주세요.</p>
    <a href="%s" style="background:#2B6CB0;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
      비밀번호 재설정하기
    </a>
    <p style="margin-top:16px;color:#555;">
      또는 아래 주소를 복사해 브라우저에 붙여넣기 👇<br>
      <span style="word-break:break-all;color:#2B6CB0;">%s</span>
    </p>
  </div>
""".formatted(user.getName(), link, link);

    }

    @Transactional
    public void verifyResetToken(String token) {
        var dec = jwt.verify(token);
        if (!"email".equals(dec.getClaim("typ").asString()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다.");
    }

    @Transactional
    public void resetPassword(String token, String newPw) {
        var dec = jwt.verify(token);
        String email = dec.getSubject();

        var user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        user.setPasswordHash(Passwords.hash(newPw));
        user.setUpdatedAt(Instant.now());
        users.save(user);
    }
}
