package doHoaSen.SpeedNews.news.service;

import doHoaSen.SpeedNews.news.domain.NewsItem;
import doHoaSen.SpeedNews.sse.SseHub;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RssPoller {

    private final RssService rss;
    private final SseHub hub;

    // 생성자 주입 (Lombok 없이 확실하게)
    public RssPoller(RssService rss, SseHub hub) {
        this.rss = rss;
        this.hub = hub;
    }

    // 카테고리별로 본 링크 저장 (간단 중복 방지)
    private final Map<String, Set<String>> seen = new ConcurrentHashMap<>();

    @Scheduled(fixedDelay = 300_000)
    public void tick() {
        // ✅ Null 문제 회피: 빈 컬렉션 방어
        Set<String> cats = Optional.ofNullable(rss.categories()).orElseGet(Collections::emptySet);

        for (String cat : cats) {
            List<NewsItem> list = Optional.ofNullable(rss.fetch(cat)).orElseGet(List::of);

            // LRU 비슷한 트림이 되는 LinkedHashMap 백킹 Set
            Set<String> bucket = seen.computeIfAbsent(cat, k ->
                    Collections.newSetFromMap(new LinkedHashMap<String, Boolean>(256, 0.75f, true) {
                        @Override
                        protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) {
                            return size() > 800;
                        }
                    })
            );

            for (NewsItem item : list) {
                String id = item.link(); // GUID가 있으면 그걸 써도 됨
                if (id != null && bucket.add(id)) {
                    hub.publish(cat, item);         // 카테고리 채널
                    if (!"all".equals(cat)) {
                        hub.publish("all", item);   // 통합 채널
                    }
                }
            }
        }
    }
}
