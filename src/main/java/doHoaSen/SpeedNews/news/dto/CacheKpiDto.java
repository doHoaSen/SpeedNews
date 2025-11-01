package doHoaSen.SpeedNews.news.dto;

public record CacheKpiDto(
        double hitRate,
        long hitCount,
        long missCount,
        long loadSuccessCount,
        long loadFailureCount,
        long evictionCount,
        double avgMissMillis,   // totalLoadTime / loadSuccessCount
        double timeSavedMillis  // hitCount * avgMissMillis
) {}