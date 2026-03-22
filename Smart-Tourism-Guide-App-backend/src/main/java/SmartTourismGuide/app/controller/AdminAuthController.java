package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PreAuthorize("hasRole(ROLE_ADMIN)")
    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponseDto> createAdmin(
            @Valid @RequestBody SignupDto signupDto) {

        ApiResponseDto response = adminAuthService.createAdmin(signupDto);

        if (response.getMessage().startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(response);
    }
}
