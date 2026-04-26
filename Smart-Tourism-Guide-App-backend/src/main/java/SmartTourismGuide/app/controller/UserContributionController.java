package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.ContributionResponseDto;
import SmartTourismGuide.app.dto.response.UserContributionsResponseDto;
import SmartTourismGuide.app.dto.update.UpdateEventDto;
import SmartTourismGuide.app.dto.update.UpdateHotelDto;
import SmartTourismGuide.app.dto.update.UpdatePlaceDto;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.UserContributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user/contributions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserContributionController {

    private final UserContributionService contributionService;


    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserContributionsResponseDto> getMyContributions(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(
                contributionService.getMyContributions(userDetails.getId()));
    }


    @PutMapping("/places/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContributionResponseDto> updateMyPlace(
            @PathVariable Long id,
            @RequestBody UpdatePlaceDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(
                contributionService.updateMyPlace(id, userDetails.getId(), dto));
    }


    @PutMapping("/events/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContributionResponseDto> updateMyEvent(
            @PathVariable Long id,
            @RequestBody UpdateEventDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(
                contributionService.updateMyEvent(id, userDetails.getId(), dto));
    }

    @PutMapping("/hotels/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContributionResponseDto> updateMyHotel(
            @PathVariable Long id,
            @RequestBody UpdateHotelDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(
                contributionService.updateMyHotel(id, userDetails.getId(), dto));
    }
}