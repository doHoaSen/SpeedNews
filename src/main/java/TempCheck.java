import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

public class TempCheck {
    public static void main(String[] args) {
        Argon2 argon2 = Argon2Factory.create(Argon2Factory.Argon2Types.ARGON2id);
        String raw = "admin1234";
        String hash = argon2.hash(3, 65536, 1, raw);
        System.out.println("✅ New Argon2 hash = " + hash);
    }
}
