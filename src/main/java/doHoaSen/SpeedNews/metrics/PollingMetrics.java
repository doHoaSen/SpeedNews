package doHoaSen.SpeedNews.metrics;

import java.lang.management.ManagementFactory;
import java.util.concurrent.atomic.AtomicLong;

public class PollingMetrics {
    // rss fetch 호출 횟수
    public static final AtomicLong rssFetchCount = new AtomicLong();

    // 기사 없는 fetch
    public static final AtomicLong emptyFetchCount = new AtomicLong();

    // SSE publish 횟수
    public static final AtomicLong ssePublishCount = new AtomicLong();

    // JVM Heap 사용량 (MB)
    public static long usedHeapMB(){
        long used =
                ManagementFactory.getMemoryMXBean()
                        .getHeapMemoryUsage()
                        .getUsed();

        return used / (1024 * 1024);

    }

    public static void reset(){
        rssFetchCount.set(0);
        emptyFetchCount.set(0);
        ssePublishCount.set(0);
    }
}
