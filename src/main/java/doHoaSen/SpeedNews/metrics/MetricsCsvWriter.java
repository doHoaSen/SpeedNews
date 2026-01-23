package doHoaSen.SpeedNews.metrics;

import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.time.LocalDateTime;

// CSV 자동 저장
@Profile("local")
@Component
public class MetricsCsvWriter {
    private static final String FILE_PATH =
            System.getProperty("user.dir") + "/speednews_metrics.csv";

    @Scheduled(fixedRate = 300_000)
    public void writeCsv () throws Exception{
        System.out.println("[CSV] writing metrics...");
        try (FileWriter fw = new FileWriter(FILE_PATH, true)) {
            fw.write(String.format(
                    "%s,%d,%d,%d,%d%n",
                    LocalDateTime.now(),
                    PollingMetrics.rssFetchCount.get(),
                    PollingMetrics.emptyFetchCount.get(),
                    PollingMetrics.ssePublishCount.get(),
                    PollingMetrics.usedHeapMB()
            ));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
