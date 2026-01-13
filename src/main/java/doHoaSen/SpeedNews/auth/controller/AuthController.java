package doHoaSen.SpeedNews.auth.controller;

import doHoaSen.SpeedNews.auth.dto.AuthDtos.*;
import doHoaSen.SpeedNews.auth.service.AuthService;
import doHoaSen.SpeedNews.auth.service.EmailVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailService;


    /** 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterReq req) {
        authService.register(req);
        return ResponseEntity.status(201).build();
    }

    /** 이메일 인증 코드 입력 */
    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestBody @Valid VerifyEmailReq req) {
        emailService.verifyEmail(req);
        return ResponseEntity.ok().build();
    }

    /** 이메일 인증 링크 클릭*/
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmailByLink(@RequestParam("token") String token) {
        emailService.verifyEmailByToken(token);
        String html = """
        <!doctype html>
        <html lang="ko">
          <head>
            <meta charset="utf-8"/>
            <title>이메일 인증 완료</title>
            <style>
              body { font-family: Pretendard, sans-serif; text-align: center; margin-top: 80px; color: #333; }
              h2 { color: #2B6CB0; }
              a { display: inline-block; margin-top: 24px; padding: 10px 20px; background: #2B6CB0; color: white; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <h2>이메일 인증이 완료되었습니다 🎉</h2>
            <p>SpeedNews 이메일 인증이 성공했습니다.<br/>이 창을 닫고 앱으로 돌아가 로그인해 주세요.</p>
            <a href="https://speednews.it.kr/login">로그인하러 가기</a>
          </body>
        </html>
    """;

        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=utf-8")
                .body(html);
    }

    /** 이메일 인증 재발송 */
    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        authService.resendVerification(email);
        return ResponseEntity.ok().build();
    }

    /** 5️⃣ 로그인 */
    @PostMapping("/login")
    public ResponseEntity<TokenRes> login(@RequestBody @Valid LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** 6️⃣ 토큰 리프레시 */
    @PostMapping("/refresh")
    public ResponseEntity<TokenRes> refresh(@RequestBody @Valid RefreshReq req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    /** 7️⃣ 내 정보 (JWT 필요) */
    @GetMapping("/me")
    public ResponseEntity<MeRes> me(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null)
            return ResponseEntity.status(401).build();
        Long uid = (Long) auth.getPrincipal();
        return ResponseEntity.ok(authService.me(uid));
    }

    /** 비밀번호 재설정 요청 */
    @PostMapping("/request-reset")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        authService.sendPasswordResetMail(email);
        return ResponseEntity.ok().build();
    }

    /** 이메일 링크 클릭 시 — 토큰 검증 후 React 페이지로 리다이렉트 */
    @GetMapping("/verify-reset")
    public ResponseEntity<Void> verifyResetLink(@RequestParam("token") String token) {
        // ✅ 1️⃣ 토큰 유효성 검증
        authService.verifyResetToken(token);

        // ✅ 2️⃣ React 프론트엔드로 이동시키기
        String redirectUrl = "http://localhost:5173/reset-password?token=" + token; // 로컬 개발용
        // 배포 후에는 "https://speednews.it.kr/reset-password?token=" 로 변경

        return ResponseEntity.status(302) // 302 Redirect
                .header("Location", redirectUrl)
                .build();
    }

    /** 비밀번호 재설정 링크 클릭 */
    @GetMapping("/verify-reset-pw")
    public ResponseEntity<Void> verifyResetByLink(@RequestParam("token") String token) {
        // 토큰 검증 (유효/만료/형식 체크)
        authService.verifyResetToken(token);

        // 검증 통과 시 React 페이지로 리다이렉트
        String redirectUrl = "http://localhost:5173/reset-password?token=" + token;
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", redirectUrl)
                .build();
    }

    /** 새 비밀번호 설정 */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    /** 회원탈퇴 */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteAccount(
            @RequestBody Map<String, String> body, HttpServletRequest req
    ){
        Long uid = (Long) req.getAttribute("uid");
        String password = body.get("password");
        authService.deleteAccount(uid, password);
        return ResponseEntity.noContent().build();
    }
}
