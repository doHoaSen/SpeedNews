package doHoaSen.SpeedNews.metrics;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MetricLogger {

    @Scheduled(fixedRate = 300_000) // 5분 단위 기록
    public void logMetrics(){
        log.info(
                "[METRICS] fetch={} empty={} sse={} heap={}MB",
                PollingMetrics.rssFetchCount.get(),
                PollingMetrics.emptyFetchCount.get(),
                PollingMetrics.ssePublishCount.get(),
                PollingMetrics.usedHeapMB()
        );
    }
}
