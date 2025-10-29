package doHoaSen.SpeedNews.auth.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import doHoaSen.SpeedNews.auth.domain.AppUser;
import doHoaSen.SpeedNews.auth.domain.UserRepo;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserRepo users;

    public JwtAuthFilter(JwtService jwt, UserRepo users){
        this.jwt=jwt;
        this.users=users;
    }

    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // ✅ 인증 없이 접근 가능한 URL들은 필터 무시
        String path = req.getRequestURI();
        if (path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/verify-email") ||
                path.startsWith("/api/auth/resend-verification") ||
                path.startsWith("/api/auth/request-reset") ||
                path.startsWith("/api/auth/verify-reset") ||   // ✅ 추가
                path.startsWith("/api/auth/reset-password")) {  // ✅ 추가

            chain.doFilter(req, res);
            return;
        }

        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                DecodedJWT dj = jwt.verify(h.substring(7));
                if (!"access".equals(dj.getClaim("typ").asString())) throw new RuntimeException("not access");
                Long uid = Long.valueOf(dj.getSubject());
                AppUser u = users.findById(uid).orElse(null);
                if (u != null && u.isEnabled()) {
                    var auths = u.getRoles().stream()
                            .map(r -> new SimpleGrantedAuthority(r.getName()))
                            .collect(Collectors.toList());
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(uid, null, auths)
                    );

                    // ✅ request에 uid 전달
                    req.setAttribute("uid", uid);
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(req, res);
    }
}
