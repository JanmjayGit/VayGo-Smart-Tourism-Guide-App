package SmartTourismGuide.app.controller;

import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.dto.response.FavoriteCheckResponseDto;
import SmartTourismGuide.app.dto.response.FavoriteResponseDto;
import SmartTourismGuide.app.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{placeId}")
    public ResponseEntity<ApiResponseDto> addFavorite(
            @PathVariable Long placeId,
            Authentication authentication) {

        String username = authentication.getName();
        favoriteService.addFavorite(placeId, username);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto("Place added to favorites successfully"));
    }

    @DeleteMapping("/{placeId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long placeId,
            Authentication authentication) {

        String username = authentication.getName();
        favoriteService.removeFavorite(placeId, username);

        return ResponseEntity.noContent().build();
    }


    @GetMapping
    public ResponseEntity<Page<FavoriteResponseDto>> getUserFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        // Limit page size to 100
        size = Math.min(size, 100);

        String username = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FavoriteResponseDto> favorites = favoriteService.getUserFavorites(username, pageable);

        return ResponseEntity.ok(favorites);
    }


    @GetMapping("/check/{placeId}")
    public ResponseEntity<FavoriteCheckResponseDto> checkFavorite(
            @PathVariable Long placeId,
            Authentication authentication) {

        String username = authentication.getName();
        FavoriteCheckResponseDto response = favoriteService.isFavorited(placeId, username);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/recent")
    public ResponseEntity<List<FavoriteResponseDto>> getRecentFavorites(
            Authentication authentication) {

        String username = authentication.getName();
        List<FavoriteResponseDto> recentFavorites = favoriteService.getRecentFavorites(username);

        return ResponseEntity.ok(recentFavorites);
    }


    @GetMapping("/count")
    public ResponseEntity<Long> getFavoritesCount(Authentication authentication) {
        String username = authentication.getName();
        long count = favoriteService.getFavoritesCount(username);

        return ResponseEntity.ok(count);
    }
}
