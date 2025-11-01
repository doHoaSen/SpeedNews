package doHoaSen.SpeedNews.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class Hash {
    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                String hexPart = Integer.toHexString(0xff & b);
                if (hexPart.length() == 1) hex.append('0');
                hex.append(hexPart);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
