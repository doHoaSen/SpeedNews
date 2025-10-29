package doHoaSen.SpeedNews.admin;

import doHoaSen.SpeedNews.auth.domain.Role;
import doHoaSen.SpeedNews.auth.domain.RoleRepo;
import doHoaSen.SpeedNews.auth.domain.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepo users; private final RoleRepo roles;

    @GetMapping("/users")
    public List<UserSummary> listUsers() {
        return users.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getEmail(),
                        u.isEmailVerified(), u.getRoles().stream().map(Role::getName).toList()))
                .toList();
    }

    @PostMapping("/users/{id}/grant-admin")
    public void grant(@PathVariable Long id) {
        var u = users.findById(id).orElseThrow();
        u.getRoles().add(roles.findByName("ROLE_ADMIN").orElseThrow());
        users.save(u);
    }

    public record UserSummary(Long id, String email, boolean emailVerified, List<String> roles) {}
}
