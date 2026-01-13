package doHoaSen.SpeedNews.common.error;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ErrorBody(Instant timestamp, int status, String error, String message, String path, Map<String,String> validation) {}

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorBody> api(ApiException ex, org.springframework.web.context.request.WebRequest req) {
        return build(ex.getStatus(), ex.getMessage(), req, null);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorBody> rse(ResponseStatusException ex, org.springframework.web.context.request.WebRequest req) {
        return build(ex.getStatusCode() instanceof HttpStatus hs ? hs : HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason(), req, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> invalid(MethodArgumentNotValidException ex, org.springframework.web.context.request.WebRequest req) {
        Map<String,String> v = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> v.put(fe.getField(), fe.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Validation failed", req, v);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> other(Exception ex, org.springframework.web.context.request.WebRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal error", req, null);
    }

    private ResponseEntity<ErrorBody> build(HttpStatus st, String msg, org.springframework.web.context.request.WebRequest req, Map<String,String> v) {
        String path = Optional.ofNullable(req.getDescription(false)).orElse("uri=?").replace("uri=","");
        var body = new ErrorBody(Instant.now(), st.value(), st.getReasonPhrase(), msg, path, v);
        return ResponseEntity.status(st).body(body);
    }
}
