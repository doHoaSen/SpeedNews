package doHoaSen.SpeedNews.news.domain;

public record NewsItem (
    String source,
    String catecory,
    String title,
    String link,
    String description,
    String author,
    String pubDateIso,
    String thumbnail
){}
