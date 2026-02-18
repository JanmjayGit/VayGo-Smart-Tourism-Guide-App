package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.ProfileDto;
import SmartTourismGuide.app.dto.update.UpdateProfileDto;
import SmartTourismGuide.app.dto.update.UserPreferencesDto;
import SmartTourismGuide.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDto> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        ProfileDto profile = userService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDto> updateUserProfile(
            @Valid @RequestBody UpdateProfileDto updateDto,
            Authentication authentication) {
        String username = authentication.getName();
        ProfileDto updatedProfile = userService.updateUserProfile(username, updateDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferencesDto> getUserPreferences(Authentication authentication) {
        String username = authentication.getName();
        UserPreferencesDto preferences = userService.getUserPreferences(username);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferencesDto> updateUserPreferences(
            @Valid @RequestBody UserPreferencesDto preferencesDto,
            Authentication authentication) {
        String username = authentication.getName();
        UserPreferencesDto updatedPreferences = userService.updateUserPreferences(username, preferencesDto);
        return ResponseEntity.ok(updatedPreferences);
    }
}
