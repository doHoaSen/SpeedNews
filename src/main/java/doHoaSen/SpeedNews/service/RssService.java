package doHoaSen.SpeedNews.service;

import com.github.benmanes.caffeine.cache.stats.CacheStats;
import doHoaSen.SpeedNews.config.NewsProperties;
import doHoaSen.SpeedNews.dto.CacheKpiDto;
import doHoaSen.SpeedNews.dto.NewsItem;
import com.github.benmanes.caffeine.cache.*;
import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class RssService {

    private final Map<String, String> feeds;

    private final Cache<String, List<NewsItem>> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(60))
            .maximumSize(100)
            .recordStats()
            .build();

    public RssService(NewsProperties props) {
        this.feeds = Objects.requireNonNull(
                props.getFeeds(), "news.feeds must not be null");
    }

    public List<NewsItem> fetch(String category) {
        String key = feeds.containsKey(category) ? category : "all";
        return cache.get(key, k -> readFeed(feeds.get(k), k));
    }

    private List<NewsItem> readFeed(String url, String category) {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            try (XmlReader in = new XmlReader(conn.getInputStream())) {
                SyndFeed feed = new SyndFeedInput().build(in);
                String source = feed.getTitle();

                List<NewsItem> list = new ArrayList<>();
                for (SyndEntry e : feed.getEntries()) {
                    String publishedAt =
                            e.getPublishedDate() != null
                                    ? e.getPublishedDate().toInstant().toString()
                                    : null;

                    list.add(new NewsItem(
                            source,
                            category,
                            e.getTitle(),
                            e.getLink(),
                            Optional.ofNullable(e.getDescription())
                                    .map(SyndContent::getValue).orElse(""),
                            e.getAuthor(),
                            publishedAt,
                            null,
                            Instant.now().toString()
                    ));
                }
                return list;
            }
        } catch (Exception ex) {
            return List.of();
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    public Set<String> categories() {
        return feeds.keySet();
    }

    public CacheKpiDto snapshotKpi() {
        CacheStats s = cache.stats();
        long loads = s.loadSuccessCount();
        double avgMissMs =
                loads == 0 ? 0.0 : (s.totalLoadTime() / 1_000_000.0) / loads;
        double timeSavedMs = s.hitCount() * avgMissMs;

        return new CacheKpiDto(
                s.hitRate(),
                s.hitCount(),
                s.missCount(),
                s.loadSuccessCount(),
                s.loadFailureCount(),
                s.evictionCount(),
                avgMissMs,
                timeSavedMs
        );
    }
}
