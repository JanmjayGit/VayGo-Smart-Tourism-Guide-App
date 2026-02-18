package SmartTourismGuide.app.service.impl;

import SmartTourismGuide.app.dto.response.ProfileDto;
import SmartTourismGuide.app.dto.update.UpdateProfileDto;
import SmartTourismGuide.app.dto.update.UserPreferencesDto;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.entity.UserPreferences;
import SmartTourismGuide.app.exceptions.ResourceNotFoundException;
import SmartTourismGuide.app.mapper.ProfileMapper;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.repository.UserPreferencesRepository;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
        return UserDetailsImpl.build(user);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElse(null);

        return ProfileMapper.toProfileDto(user, preferences);
    }

    @Override
    @Transactional
    public ProfileDto updateUserProfile(String username, UpdateProfileDto updateDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Update user fields
        if (updateDto.getFirstName() != null) {
            user.setFirstName(updateDto.getFirstName());
        }
        if (updateDto.getLastName() != null) {
            user.setLastName(updateDto.getLastName());
        }
        if (updateDto.getPhoneNumber() != null) {
            user.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getBio() != null) {
            user.setBio(updateDto.getBio());
        }
        if (updateDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updateDto.getProfilePictureUrl());
        }
        if (updateDto.getEmail() != null) {
            // Check if email is already taken by another user
            userRepository.findByEmail(updateDto.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new RuntimeException("Email is already in use by another account");
                }
            });
            user.setEmail(updateDto.getEmail());
        }

        User updatedUser = userRepository.save(user);

        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElse(null);

        return ProfileMapper.toProfileDto(updatedUser, preferences);
    }

    @Override
    @Transactional(readOnly = true)
    public UserPreferencesDto getUserPreferences(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Return default preferences if none exist
                    UserPreferences defaultPrefs = new UserPreferences();
                    defaultPrefs.setLanguage("en");
                    defaultPrefs.setCurrency("USD");
                    defaultPrefs.setNotificationsEnabled(true);
                    defaultPrefs.setTheme("light");
                    return defaultPrefs;
                });

        return ProfileMapper.toUserPreferencesDto(preferences);
    }

    @Override
    @Transactional
    public UserPreferencesDto updateUserPreferences(String username, UserPreferencesDto preferencesDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElseGet(() -> ProfileMapper.toUserPreferences(preferencesDto, user));

        if (preferences.getId() != null) {
            // Update existing preferences
            ProfileMapper.updateUserPreferencesFromDto(preferences, preferencesDto);
        }

        UserPreferences savedPreferences = userPreferencesRepository.save(preferences);
        return ProfileMapper.toUserPreferencesDto(savedPreferences);
    }
}
