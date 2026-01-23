package doHoaSen.SpeedNews.dto;

public record NewsItem (
    String source,
    String catecory,
    String title,
    String link,
    String description,
    String author,
    String pubDateIso,
    String thumbnail,
    String detectedAt
){}
