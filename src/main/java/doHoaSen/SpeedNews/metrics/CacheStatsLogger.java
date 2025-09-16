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
    @Scheduled(fixedRate = 60_000)
    public void logKpi() {
        var k = rss.snapshotKpi(); // ← RssService에 앞서 만든 snapshotKpi() 사용
        log.info("[cacheKPI] hitRate={} hits={} misses={} avgMissMs={} savedMs={}",
                String.format("%.3f", k.hitRate()),
                k.hitCount(), k.missCount(),
                String.format("%.1f", k.avgMissMillis()),
                String.format("%.0f", k.timeSavedMillis()));
    }
}