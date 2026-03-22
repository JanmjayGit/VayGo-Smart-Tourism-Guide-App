package SmartTourismGuide.app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.enums.Role;
import SmartTourismGuide.app.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponseDto createAdmin(SignupDto dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            return new ApiResponseDto("Error: Username already taken");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            return new ApiResponseDto("Error: Email already in use");
        }

        User admin = new User();

        admin.setUsername(dto.getUsername());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setFirstName(dto.getFirstName());
        admin.setLastName(dto.getLastName());

        userRepository.save(admin);

        return new ApiResponseDto("Admin created successfully");
    }
}