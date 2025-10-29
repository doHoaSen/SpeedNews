package doHoaSen.SpeedNews.auth.event;

import doHoaSen.SpeedNews.auth.service.EmailVerificationService;
import doHoaSen.SpeedNews.auth.domain.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class SendVerificationEmailListener {

    private final EmailVerificationService emailVerificationService;
    private final UserRepo users;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(SendVerificationEmailEvent event) {
        var user = users.findById(event.userId()).orElseThrow();
        emailVerificationService.sendVerificationMail(user);
        System.out.println("📧 AFTER_COMMIT: 이메일 인증 메일 발송 완료 (" + user.getEmail() + ")");
    }
}
