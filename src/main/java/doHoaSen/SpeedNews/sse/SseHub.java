package doHoaSen.SpeedNews.sse;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseHub {
    private static final long TIMEOUT_MS = Duration.ofMinutes(30).toMillis();
    private final Map<String, CopyOnWriteArraySet<SseEmitter>> rooms = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String category) {
        var set = rooms.computeIfAbsent(category, k -> new CopyOnWriteArraySet<>());
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        set.add(emitter);

        emitter.onCompletion(() -> set.remove(emitter));
        emitter.onTimeout(() -> set.remove(emitter));
        emitter.onError(e -> set.remove(emitter));

        try { emitter.send(SseEmitter.event().name("ping").data("ok")); } catch (IOException ignored) {}
        return emitter;
    }

    public void publish(String category, Object data) {
        var set = rooms.getOrDefault(category, new CopyOnWriteArraySet<>());
        for (SseEmitter e : set) {
            try {
                e.send(SseEmitter.event()
                        .name("news")
                        .id(UUID.randomUUID().toString())
                        .data(data, MediaType.APPLICATION_JSON));
            } catch (IOException ex) {
                set.remove(e);
            }
        }
    }
}
