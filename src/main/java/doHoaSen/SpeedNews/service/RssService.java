package doHoaSen.SpeedNews.service;

import com.rometools.rome.feed.rss.Item;
import doHoaSen.SpeedNews.config.NewsProperties;
import doHoaSen.SpeedNews.dto.CacheKpiDto;
import doHoaSen.SpeedNews.dto.NewsItem;
import com.github.benmanes.caffeine.cache.*;
import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

import com.github.benmanes.caffeine.cache.stats.CacheStats;

@Service
public class RssService {
    private final Map<String,String> feeds;
    private final Cache<String, List<NewsItem>> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(60))
            .maximumSize(100)
            .recordStats()
            .build();

    public RssService(NewsProperties props) {              // 안전하게 주입
        this.feeds = Objects.requireNonNull(props.getFeeds(), "news.feeds must not be null");
    }

//    public List<NewsItem> fetch(String category) {  // public
//        String key = feeds.containsKey(category) ? category : "all";
//        return cache.get(key, k -> readFeed(feeds.get(key), k));
//    }

    // 테스트용
    public List<NewsItem> fetch(String category) {
        return readFeed(feeds.get(category), category);
    }

    private String extractPubDateIso(SyndFeed feed, SyndEntry e) {
        Date d = null;

        // 1. 일반 synd entry (일부 언론사)
        if (e.getPublishedDate() != null) {
            d = e.getPublishedDate();
        }

        // 2. RSS 2.0 wire entry (매일경제는 여기!)
        if (d == null && e.getWireEntry() instanceof com.rometools.rome.feed.rss.Item item) {
            d = item.getPubDate();
        }

        // 3. 최후 fallback (lastBuildDate)
        if (d == null && feed.getPublishedDate() != null) {
            d = feed.getPublishedDate();
        }

        return d != null ? d.toInstant().toString() : null;
    }


    private List<NewsItem> readFeed(String url, String category) {
        HttpURLConnection conn = null;
        try {
            URL u = new URL(url);
            conn = (HttpURLConnection) u.openConnection();
            conn.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                            + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            try (XmlReader in = new XmlReader(conn.getInputStream())) {
                SyndFeedInput input = new SyndFeedInput();
                input.setPreserveWireFeed(true);   // 핵심
                SyndFeed feed = input.build(in);

                String source = feed.getTitle();
                List<SyndEntry> entries = feed.getEntries();
                List<NewsItem> list = new ArrayList<>(entries.size());
                String pubDateIso = null;

                for (SyndEntry e : entries) {

                    String desc = Optional.ofNullable(e.getDescription())
                            .map(SyndContent::getValue).orElse("");

                    if (e.getPublishedDate() != null) {
                        pubDateIso = e.getPublishedDate().toInstant().toString();
                    }

                    String receivedAt = Instant.now().toString();

                    String categoryNorm = CategoryNormalizer.normalize(category);
                    String thumb = (e.getEnclosures()!=null && !e.getEnclosures().isEmpty())
                            ? e.getEnclosures().get(0).getUrl() : null;


                    list.add(new NewsItem(
                            source,
                            categoryNorm,
                            e.getTitle(),
                            e.getLink(),
                            desc,
                            e.getAuthor(),
                            pubDateIso,
                            thumb,
                            receivedAt // 서버 기준 수신 시각
                    ));
                }
                return list;
            }
        } catch (Exception ex) {
            ex.printStackTrace(); // 원인 로그 확인
            return List.of();
        } finally {
            if (conn != null) conn.disconnect();
        }
    }


    public Set<String> categories() {   // public
        return feeds.keySet();
    }


    public CacheKpiDto snapshotKpi() {
        CacheStats s = cache.stats();
        long loads = s.loadSuccessCount();           // 캐시 미스 후 실제 로드 성공 건수
        double avgMissMs = (loads == 0) ? 0.0 : (s.totalLoadTime() / 1_000_000.0) / loads;
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
