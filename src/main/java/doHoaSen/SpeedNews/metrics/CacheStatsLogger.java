package doHoaSen.SpeedNews.metrics;

import doHoaSen.SpeedNews.service.RssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheStatsLogger {

    private final RssService rss;

    // 1분마다 KPI 로그 (원하면 주기 조절)
    @Scheduled(fixedDelay = 30_000)
    public void print() {
        var s = rss.snapshotKpi();
        log.info("[cacheKPI] hitRate={} hits={} misses={} loadOk={} loadErr={} evict={} avgMissMs={} savedMs={}",
                String.format("%.3f", s.hitRate()),
                s.hitCount(),
                s.missCount(),
                s.loadSuccessCount(),
                s.loadFailureCount(),
                s.evictionCount(),
                String.format("%.1f", s.avgMissMillis()),
                String.format("%.0f", s.timeSavedMillis()));
    }
}