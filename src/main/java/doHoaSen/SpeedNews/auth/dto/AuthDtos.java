// doHoaSen.SpeedNews.auth.dto.AuthDtos

package doHoaSen.SpeedNews.auth.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class AuthDtos {

    public record PhoneReq(
            @NotBlank @Pattern(regexp = "^[0-9+]{10,15}$") String phone
    ) {}



    public record RegisterReq(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank
            @Pattern(
                    regexp = "^(?=.*[A-Za-z])(?=.*(\\d|\\W)).{6,}$",
                    message = "비밀번호는 6자 이상이며, 문자와 숫자/기호를 포함해야 합니다"
            )
            String password,
            @NotBlank String phone
    ) {}

    public record LoginReq(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    //  프런트와 일치하도록 이름 변경
    public record TokenRes(
            String access,
            String refresh
    ) {}

    public record RefreshReq(
            @NotBlank String refreshToken
    ) {}

    public record VerifyEmailReq(
            @NotBlank String email,
            @NotBlank String code
    ) {}

    public record MeRes(
            Long id,
            String email,
            boolean emailVerified,
            List<String> roles
    ) {}


}
