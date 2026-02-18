package SmartTourismGuide.app.mapper;

import SmartTourismGuide.app.dto.response.ProfileDto;
import SmartTourismGuide.app.dto.update.UserPreferencesDto;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.entity.UserPreferences;

public class ProfileMapper {

    public static ProfileDto toProfileDto(User user, UserPreferences preferences) {
        return ProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .preferences(preferences != null ? toUserPreferencesDto(preferences) : null)
                .build();
    }

    public static UserPreferencesDto toUserPreferencesDto(UserPreferences preferences) {
        return UserPreferencesDto.builder()
                .language(preferences.getLanguage())
                .currency(preferences.getCurrency())
                .notificationsEnabled(preferences.getNotificationsEnabled())
                .theme(preferences.getTheme())
                .travelInterests(preferences.getTravelInterests())
                .build();
    }

    public static UserPreferences toUserPreferences(UserPreferencesDto dto, User user) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUser(user);
        preferences.setLanguage(dto.getLanguage());
        preferences.setCurrency(dto.getCurrency());
        preferences.setNotificationsEnabled(dto.getNotificationsEnabled());
        preferences.setTheme(dto.getTheme());
        preferences.setTravelInterests(dto.getTravelInterests());
        return preferences;
    }

    public static void updateUserPreferencesFromDto(UserPreferences preferences, UserPreferencesDto dto) {
        preferences.setLanguage(dto.getLanguage());
        preferences.setCurrency(dto.getCurrency());
        preferences.setNotificationsEnabled(dto.getNotificationsEnabled());
        preferences.setTheme(dto.getTheme());
        preferences.setTravelInterests(dto.getTravelInterests());
    }
}
