package doHoaSen.SpeedNews.service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.Locale;

public class RssDateParser {

    public static final DateTimeFormatter FORMATTER =
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("EEE,")
                    .optionalStart().appendLiteral(' ').optionalEnd()
                    .appendPattern("dd MMM yyyy HH:mm:ss ")
                    .optionalStart().appendPattern("Z").optionalEnd()    // +0900
                    .optionalStart().appendPattern("XXX").optionalEnd()  // +09:00
                    .toFormatter(Locale.ENGLISH);

    public static String parseToIso(String raw){
        if (raw == null || raw.isBlank()) return null;
        try{
            ZonedDateTime zdt = ZonedDateTime.parse(raw.trim(), FORMATTER);
            return zdt.toInstant().toString();
        }catch(Exception e){
            return null;
        }
    }
}

