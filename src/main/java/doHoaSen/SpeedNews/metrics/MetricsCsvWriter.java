package doHoaSen.SpeedNews.metrics;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.time.LocalDateTime;

// CSV 자동 저장
@Component
public class MetricsCsvWriter {
    private static final String FILE = "speednews_metrics.csv";

    @Scheduled(fixedRate = 300_000)
    public void writeCsv () throws Exception{
        try (FileWriter fw = new FileWriter(FILE, true)) {
            fw.write(String.format(
                    "%s,%d,%d,%d,%d%n",
                    LocalDateTime.now(),
                    PollingMetrics.rssFetchCount.get(),
                    PollingMetrics.emptyFetchCount.get(),
                    PollingMetrics.ssePublishCount.get(),
                    PollingMetrics.usedHeapMB()
            ));
        }
    }
}
