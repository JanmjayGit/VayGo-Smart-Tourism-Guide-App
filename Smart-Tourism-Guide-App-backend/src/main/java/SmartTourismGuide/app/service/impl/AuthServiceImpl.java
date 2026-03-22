package SmartTourismGuide.app.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import SmartTourismGuide.app.dto.request.ForgotPasswordRequest;
import SmartTourismGuide.app.dto.request.LoginDto;
import SmartTourismGuide.app.dto.request.ResetPasswordRequest;
import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.dto.response.ApiResponseDto;
import SmartTourismGuide.app.dto.response.JwtResponseDto;
import SmartTourismGuide.app.entity.PasswordResetToken;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.mapper.UserMapper;
import SmartTourismGuide.app.repository.PasswordResetTokenRepository;
import SmartTourismGuide.app.repository.UserRepository;
import SmartTourismGuide.app.security.jwt.JwtUtils;
import SmartTourismGuide.app.security.services.UserDetailsImpl;
import SmartTourismGuide.app.service.AuthService;
import SmartTourismGuide.app.service.EmailService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // Login
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

    // Register
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

    // Forgot Password
    @Override
    @Transactional
    public ApiResponseDto forgotPassword(ForgotPasswordRequest request) {
        // Always return the same message to prevent user enumeration
        final String safeMessage = "If that email is registered, a reset link has been sent.";

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Delete any existing token for this user first
            tokenRepository.deleteByUserId(user.getId());

            // Generate a new secure token (UUID) valid for 30 minutes
            String rawToken = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                    rawToken, user, LocalDateTime.now().plusMinutes(30));
            tokenRepository.save(resetToken);

            // Build the reset link pointing to the frontend page
            String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

            // Fire-and-forget email (if mail config missing, log the link)
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            } catch (Exception ex) {
                // Log for developer convenience during local dev without SMTP
                System.out.println("[DEV] Password reset link for " + user.getEmail() + ": " + resetLink);
            }
        });

        return new ApiResponseDto(safeMessage);
    }

    // Reset Password
    @Override
    @Transactional
    public ApiResponseDto resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Reset link has expired. Please request a new one.");
        }
        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return new ApiResponseDto("Password reset successfully. You can now sign in with your new password.");
    }
}
