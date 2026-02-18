package SmartTourismGuide.app.service;

import SmartTourismGuide.app.dto.response.FavoriteCheckResponseDto;
import SmartTourismGuide.app.dto.response.FavoriteResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FavoriteService {

    void addFavorite(Long placeId, String username);
    void removeFavorite(Long placeId, String username);
    Page<FavoriteResponseDto> getUserFavorites(String username, Pageable pageable);
    FavoriteCheckResponseDto isFavorited(Long placeId, String username);
    List<FavoriteResponseDto> getRecentFavorites(String username);
    long getFavoritesCount(String username);
}
