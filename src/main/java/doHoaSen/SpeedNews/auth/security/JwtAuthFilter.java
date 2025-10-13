package doHoaSen.SpeedNews.auth;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt; private final UserRepo users;
    public JwtAuthFilter(JwtService jwt, UserRepo users){ this.jwt=jwt; this.users=users; }

    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                DecodedJWT dj = jwt.verify(h.substring(7));
                if (!"access".equals(dj.getClaim("typ").asString())) throw new RuntimeException("not access");
                Long uid = Long.valueOf(dj.getSubject());
                AppUser u = users.findById(uid).orElse(null);
                if (u != null && u.isEnabled()) {
                    var auths = u.getRoles().stream().map(r -> new SimpleGrantedAuthority(r.getName())).collect(Collectors.toList());
                    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(uid, null, auths));
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(req, res);
    }
