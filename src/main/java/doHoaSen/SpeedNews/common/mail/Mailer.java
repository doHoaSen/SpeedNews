package doHoaSen.SpeedNews.common.mail;

public interface Mailer {
    void send(String to, String subject, String content);
}
