package doHoaSen.SpeedNews.auth.service;

import doHoaSen.SpeedNews.auth.domain.*;
import doHoaSen.SpeedNews.auth.dto.AuthDtos;
import doHoaSen.SpeedNews.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import jakarta.mail.internet.MimeMessage;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepo verifications;
    private final JavaMailSender mailSender;
    private final JwtService jwt;
    private final UserRepo users;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendVerificationMail(AppUser user) {
        // 기존 인증 무효화
        verifications.invalidateAllByUser(user.getId());

        // 새 코드 생성
        String token = jwt.createEmailToken(user.getEmail());
        String code = String.format("%06d", new Random().nextInt(999999));
        Instant exp = Instant.now().plus(Duration.ofMinutes(30));

        // 새 객체 저장
        EmailVerification ev = new EmailVerification(user, token, code, exp);
        verifications.save(ev);

        // 메일 본문
        String link = "https://speednews.it.kr/api/auth/verify-email?token=" + token;

        String html = """
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;">
      <h2 style="color:#2B6CB0;">SpeedNews 이메일 인증</h2>
      <p>안녕하세요, %s 님!</p>
      <p>아래 버튼을 눌러 이메일 인증을 완료해주세요.</p>
      <a href="%s" style="background:#2B6CB0;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">이메일 인증하기</a>
      
      <p style="margin-top:16px;color:#555;">
        또는 아래 주소를 복사하여 브라우저 주소창에 직접 붙여넣어도 됩니다 👇<br>
        <span style="word-break:break-all;color:#2B6CB0;">
          %s
        </span>
      </p>

      <p style="margin-top:16px;color:#555;">
        또는 아래 코드를 인증 페이지에 입력해주세요.<br>
        <b style="font-size:20px;">%s</b>
      </p>
    </div>
    """.formatted(user.getName(), link, link, code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("[SpeedNews] 이메일 인증 요청");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 실패", e);
        }
    }

    @Transactional
    public void verifyEmail(AuthDtos.VerifyEmailReq req) {
        var user = users.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "가입되지 않은 이메일입니다."));

        var verification = verifications.findValidByUserAndCode(user, req.code())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 인증 코드입니다."));

        if (verification.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 코드가 만료되었습니다.");
        }

        verification.setUsed(true);
        verification.setVerified(true);
        verifications.save(verification);

        user.setEmailVerified(true);
        users.save(user);
    }


    @Transactional
    public void verifyEmailByToken(String token) {
        var verification = verifications.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다."));

        if (verification.isUsed() || verification.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "토큰이 만료되었거나 이미 사용되었습니다.");
        }

        verification.setUsed(true);
        verification.setVerified(true);
        verifications.save(verification);

        var user = verification.getUser();
        user.setEmailVerified(true);
        users.save(user);
    }


    private void markVerified(EmailVerification ev) {
        ev.setVerified(true);
        ev.getUser().setEmailVerified(true);
        verifications.save(ev);
    }

    @Transactional
    public void resendVerificationMail(AppUser user) {
        verifications.invalidateAllByUser(user.getId());
        sendVerificationMail(user);
    }

    private String generate6DigitCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public void sendMailForResetPw(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 실패", e);
        }
    }

}
