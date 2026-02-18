package SmartTourismGuide.app.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.dto.response.JwtResponseDto;
import SmartTourismGuide.app.dto.request.LoginDto;
import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.mapper.UserMapper;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.security.jwt.JwtUtils;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.AuthService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;

    @Override
    public JwtResponseDto authenticateUser(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponseDto(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    @Override
    public ApiResponseDto registerUser(SignupDto signupDto) {
        if (userRepository.existsByUsername(signupDto.getUsername())) {
            return new ApiResponseDto("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signupDto.getEmail())) {
            return new ApiResponseDto("Error: Email is already in use!");
        }

        User user = userMapper.toDTO(signupDto);
        userRepository.save(user);

        return new ApiResponseDto("User registered successfully!");
    }
}
