package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.FavoriteCheckResponseDto;
import SmartTourismGuide.app.dto.response.FavoriteResponseDto;
import SmartTourismGuide.app.entity.Favorite;
import SmartTourismGuide.app.entity.Place;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.exceptions.DuplicateFavoriteException;
import SmartTourismGuide.app.exceptions.FavoriteNotFoundException;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.repository.FavoriteRepository;
import SmartTourismGuide.app.repository.PlaceRepository;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    @Override
    @Transactional
    public void addFavorite(Long placeId, String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Validate place exists and is not deleted
        Place place = placeRepository.findByIdAndDeletedFalse(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        // Check for duplicate
        if (favoriteRepository.existsByUserIdAndPlaceId(user.getId(), placeId)) {
            throw new DuplicateFavoriteException(user.getId(), placeId);
        }

        // Create and save favorite
        Favorite favorite = new Favorite(user, place);
        favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long placeId, String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Find and delete favorite
        Favorite favorite = favoriteRepository.findByUserIdAndPlaceId(user.getId(), placeId)
                .orElseThrow(() -> new FavoriteNotFoundException(placeId));

        favoriteRepository.delete(favorite);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<FavoriteResponseDto> getUserFavorites(String username, Pageable pageable) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Fetch favorites with place data
        Page<Favorite> favorites = favoriteRepository.findUserFavorites(user.getId(), pageable);

        // Convert to DTOs
        return favorites.map(this::convertToDto);
    }


    @Override
    @Transactional(readOnly = true)
    public FavoriteCheckResponseDto isFavorited(Long placeId, String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Check existence
        boolean isFavorited = favoriteRepository.existsByUserIdAndPlaceId(user.getId(), placeId);

        return new FavoriteCheckResponseDto(placeId, isFavorited);
    }


    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponseDto> getRecentFavorites(String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Fetch recent favorites (limit 10)
        Pageable pageable = PageRequest.of(0, 10);
        List<Favorite> recentFavorites = favoriteRepository.findRecentFavorites(user.getId(), pageable);

        // Convert to DTOs
        return recentFavorites.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public long getFavoritesCount(String username) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return favoriteRepository.countByUserId(user.getId());
    }


    private FavoriteResponseDto convertToDto(Favorite favorite) {
        Place place = favorite.getPlace();

        return new FavoriteResponseDto(
                favorite.getId(),
                place.getId(),
                place.getName(),
                place.getCategory() != null ? place.getCategory().toString() : null,
                place.getCity(),
                place.getRating(),
                place.getImageUrl(),
                favorite.getCreatedAt(),
                true // Always true for favorites list
        );
    }
}
