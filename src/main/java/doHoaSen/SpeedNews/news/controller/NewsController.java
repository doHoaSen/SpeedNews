package doHoaSen.SpeedNews.news.controller;

import doHoaSen.SpeedNews.news.domain.NewsItem;
import doHoaSen.SpeedNews.news.service.RssService;
import doHoaSen.SpeedNews.sse.SseHub;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NewsController {
    private final RssService rss;
    private final SseHub hub;

    // SSE 구독: /api/stream?category=economy (없으면 all)
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam(defaultValue = "hk-all") String category) {
        return hub.subscribe(category);
    }

    // 폴백용 REST 목록
    @GetMapping("/news")
    public List<NewsItem> list(@RequestParam(defaultValue = "hk-all") String category) {
        return rss.fetch(category);
    }
}