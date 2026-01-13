package doHoaSen.SpeedNews.service;

import doHoaSen.SpeedNews.metrics.PollingMetrics;
import doHoaSen.SpeedNews.dto.NewsItem;
import doHoaSen.SpeedNews.sse.SseHub;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RssPoller {

    private final RssService rss;
    private final SseHub hub;

    // 생성자 주입
    public RssPoller(RssService rss, SseHub hub) {
        this.rss = rss;
        this.hub = hub;
    }

    // 카테고리별로 본 링크 저장 (중복 방지, LRU)
    private final Map<String, Set<String>> seen = new ConcurrentHashMap<>();

    @Scheduled(fixedDelayString = "${rss.polling.delay}")
    public void tick() {
        // Null 방어
        Set<String> cats =
                Optional.ofNullable(rss.categories())
                        .orElseGet(Collections::emptySet);

        for (String cat : cats) {
            List<NewsItem> list =
                    Optional.ofNullable(rss.fetch(cat))
                            .orElseGet(List::of);

            if (list.isEmpty()) {
                PollingMetrics.emptyFetchCount.incrementAndGet();
            }

            // LRU-like Set (최대 800)
            Set<String> bucket = seen.computeIfAbsent(cat, k ->
                    Collections.newSetFromMap(
                            new LinkedHashMap<String, Boolean>(256, 0.75f, true) {
                                @Override
                                protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) {
                                    return size() > 800;
                                }
                            }
                    )
            );

            for (NewsItem item : list) {
                String id = item.link();
                if (id != null && bucket.add(id)) {
                    PollingMetrics.ssePublishCount.incrementAndGet();
                    hub.publish(cat, item);

                    if (!"all".equals(cat)) {
                        PollingMetrics.ssePublishCount.incrementAndGet();
                        hub.publish("all", item);
                    }
                }
            }
        }
    }
}
