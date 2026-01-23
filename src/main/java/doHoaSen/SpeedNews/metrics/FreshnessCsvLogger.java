package doHoaSen.SpeedNews.metrics;

import doHoaSen.SpeedNews.dto.NewsItem;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Profile("local")
@Component
public class FreshnessCsvLogger {

    private static final String FILE =
            System.getProperty("user.dir") + "/freshness+5min.csv";

    // 중복 기록 방지
    private final Set<String> seenLinks = ConcurrentHashMap.newKeySet();

    /**
     * freshness = detectedAt - publishedAt
     */
    public void logFirstSeen(NewsItem item, long detectedAtMillis) {
        if (item.link() == null || item.pubDateIso() == null) return;

        if (!seenLinks.add(item.link())) return;

        try {
            Instant publishedAt = Instant.parse(item.pubDateIso());
            long freshnessSec =
                    (detectedAtMillis - publishedAt.toEpochMilli()) / 1000;

            try (FileWriter fw = new FileWriter(FILE, true)) {
                fw.write(String.format(
                        "%s,%s,%d%n",
                        Instant.ofEpochMilli(detectedAtMillis),
                        publishedAt,
                        freshnessSec
                ));
            }
        } catch (Exception e) {
            // 날짜 파싱 실패 시 무시
        }
    }
}
