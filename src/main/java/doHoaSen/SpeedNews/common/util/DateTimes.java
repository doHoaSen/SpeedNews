package doHoaSen.SpeedNews.common.util;

import java.time.Duration;
import java.time.Instant;

public class DateTimes {
    private DateTimes(){}
    public static Instant now() {
        return Instant.now();
    }

    public static Instant plusMinutes(long m){
        return Instant.now().plus(Duration.ofMinutes(m));
    }

    public static Instant plusDays(long d){
        return Instant.now().plus(Duration.ofDays(d));
    }
}
