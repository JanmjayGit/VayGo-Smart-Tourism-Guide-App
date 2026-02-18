package SmartTourismGuide.app.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import SmartTourismGuide.app.dto.response.ProfileDto;
import SmartTourismGuide.app.dto.update.UpdateProfileDto;
import SmartTourismGuide.app.dto.update.UserPreferencesDto;

public interface UserService extends UserDetailsService {
    ProfileDto getUserProfile(String username);

    ProfileDto updateUserProfile(String username, UpdateProfileDto updateDto);

    UserPreferencesDto getUserPreferences(String username);

    UserPreferencesDto updateUserPreferences(String username, UserPreferencesDto preferencesDto);
}
