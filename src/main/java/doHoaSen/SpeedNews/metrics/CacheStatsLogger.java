package doHoaSen.SpeedNews.metrics;

import com.github.benmanes.caffeine.cache.stats.CacheStats;
import doHoaSen.SpeedNews.news.service.RssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheStatsLogger {

    private final RssService rss;

    // 직전 누적 스냅샷(증분 계산용)
    private long prevHits = 0L;
    private long prevMisses = 0L;
    private long prevEvict = 0L;
    private long prevLoadOk = 0L;
    private long prevTotalLoadTimeNs = 0L;

    // 1분마다 KPI 로그
    @Scheduled(fixedDelay = 60_000)
    public void print() {
        // 1) 기존: 누적 KPI
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

        // 2) 추가: 최근 1분 증분 KPI
        CacheStats raw = rss.snapshotRawStats();

        long hits   = raw.hitCount();
        long misses = raw.missCount();
        long evict  = raw.evictionCount();
        long loadOk = raw.loadSuccessCount();
        long totalLoadTimeNs = raw.totalLoadTime();

        long dHits   = hits   - prevHits;
        long dMisses = misses - prevMisses;
        long dEvict  = evict  - prevEvict;
        long dLoadOk = loadOk - prevLoadOk;
        long dLoadNs = totalLoadTimeNs - prevTotalLoadTimeNs;

        // 윈도우 지표 계산
        long windowTotalReq = dHits + dMisses;
        double windowHitRate = (windowTotalReq > 0) ? (double) dHits / windowTotalReq : 0.0;
        double windowAvgMissMs = (dLoadOk > 0) ? (dLoadNs / 1_000_000.0) / dLoadOk : 0.0;
        // savedMs는 윈도우 평균 미스 시간을 이용한 근사치
        double windowSavedMs = dHits * windowAvgMissMs;

        log.info("[cacheKPI-1m] hitRate={} hits={} misses={} evict={} avgMissMs={} savedMs≈{}",
                String.format("%.3f", windowHitRate),
                dHits, dMisses, dEvict,
                String.format("%.1f", windowAvgMissMs),
                String.format("%.0f", windowSavedMs));

        // 이전 스냅샷 갱신
        prevHits = hits;
        prevMisses = misses;
        prevEvict = evict;
        prevLoadOk = loadOk;
        prevTotalLoadTimeNs = totalLoadTimeNs;
    }
}