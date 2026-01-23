package doHoaSen.SpeedNews.service;

import doHoaSen.SpeedNews.dto.NewsItem;
import doHoaSen.SpeedNews.metrics.FreshnessCsvLogger;
import doHoaSen.SpeedNews.sse.SseHub;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RssPoller {

    private final RssService rss;
    private final SseHub hub;
    private final FreshnessCsvLogger freshnessLogger;

    public RssPoller(RssService rss, SseHub hub, FreshnessCsvLogger freshnessLogger) {
        this.rss = rss;
        this.hub = hub;
        this.freshnessLogger = freshnessLogger;
    }

    @Scheduled(fixedDelayString = "${rss.polling.delay}")
    public void tick() {
        long detectedAtMillis = System.currentTimeMillis();

        for (String cat : rss.categories()) {
            List<NewsItem> list = rss.fetch(cat);

            for (NewsItem item : list) {
                //  최초 감지 시 freshness 기록
                freshnessLogger.logFirstSeen(item, detectedAtMillis);

                // SSE 전송
                hub.publish(cat, item);
            }
        }
    }
}
