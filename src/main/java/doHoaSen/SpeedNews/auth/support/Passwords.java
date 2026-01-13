package doHoaSen.SpeedNews.auth.support;

import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

public class Passwords {
    private static final Argon2 ARGON2 = Argon2Factory.create(Argon2Factory.Argon2Types.ARGON2id);

    public static String hash(String raw) {
        return ARGON2.hash(3, 65536, 1, raw);
    }

    public static boolean verify(String raw, String hash) {
        return ARGON2.verify(raw, hash);
    }
}
