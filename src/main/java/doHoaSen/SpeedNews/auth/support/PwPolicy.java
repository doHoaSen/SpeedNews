package doHoaSen.SpeedNews.auth.support;

import java.util.regex.Pattern;

public class PwPolicy {
    private static final Pattern U = Pattern.compile("[A-Z]");
    private static final Pattern L = Pattern.compile("[a-z]");
    private static final Pattern D = Pattern.compile("\\d");
    private static final Pattern S = Pattern.compile("[^A-Za-z0-9]");

    public static boolean isStrong(String pw){
        if (pw == null || pw.length() < 6) return false;
        int c = 0;
        if (U.matcher(pw).find()) c++;
        if (L.matcher(pw).find()) c++;
        if (D.matcher(pw).find()) c++;
        if (S.matcher(pw).find()) c++;
        return c >= 3;
    }
}
