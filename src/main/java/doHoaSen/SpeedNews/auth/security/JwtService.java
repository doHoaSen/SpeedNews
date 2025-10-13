package doHoaSen.SpeedNews.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JwtService {

    private final Algorithm alg;
    private final String issuer;
    private final long accessMs;
    private final long refreshMs;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.issuer:speednews}") String issuer,
            @Value("${security.jwt.accessTtlMinutes:15}") long accessMin,
            @Value("${security.jwt.refreshTtlDays:14}") long refreshDays
    ){
        this.alg = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.accessMs = accessMin * 60_000L;
        this.refreshMs = refreshDays * 24L * 3600_000L;
    }

    public String createAccess(Long uid, Collection<String> roles){
        long now = System.currentTimeMillis();
        return JWT.create().withIssuer(issuer).withSubject(String.valueOf(uid))
                .withClaim("roles", new ArrayList<>(roles))
                .withClaim("typ", "access")
                .withIssuedAt(new Date(now)).withExpiresAt(new Date(now + accessMs))
                .sign(alg);
    }

    public String createRefresh(Long uid, String family) {
        long now = System.currentTimeMillis();
        return JWT.create().withIssuer(issuer).withSubject(String.valueOf(uid))
                .withClaim("typ", "refresh").withClaim("family", family)
                .withIssuedAt(new Date(now)).withExpiresAt(new Date(now + refreshMs))
                .sign(alg);
    }

    public DecodedJWT verify(String token) {
        return JWT.require(alg).withIssuer(issuer).build().verify(token);
    }
}
