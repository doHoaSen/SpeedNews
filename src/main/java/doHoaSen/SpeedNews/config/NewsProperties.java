package doHoaSen.SpeedNews.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;

@ConfigurationProperties(prefix = "news")
public class NewsProperties {
    private Map<String, String> feeds;

    public Map<String, String> getFeeds() { return feeds; }
    public void setFeeds(Map<String, String> feeds) { this.feeds = feeds; }
}