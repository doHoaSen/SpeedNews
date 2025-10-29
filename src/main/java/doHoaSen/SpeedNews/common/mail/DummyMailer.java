package doHoaSen.SpeedNews.common.mail;

import org.springframework.stereotype.Component;

@Component
public class DummyMailer implements Mailer {
    @Override public void send(String to, String subject, String content) {
        System.out.println("[MAIL] to=" + to + " subject=" + subject + " content=" + content);
    }
}
