package SmartTourismGuide.app.mapper;

import java.util.Set;
import org.springframework.stereotype.Component;
import SmartTourismGuide.app.dto.request.SignupDto;
import SmartTourismGuide.app.enums.Role;
import SmartTourismGuide.app.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class UserMapper {
    private final PasswordEncoder encoder;

    public User toDTO(SignupDto signupDto) {
        User user = new User(signupDto.getUsername(),
                signupDto.getEmail(),
                encoder.encode(signupDto.getPassword()),
                Role.ROLE_USER);

        Set<String> strRoles = signupDto.getRole();
        if (strRoles != null) {
            if (strRoles.contains("admin")) {
                user.setRole(Role.ROLE_ADMIN);
            } else {
                user.setRole(Role.ROLE_USER);
            }
        }
        return user;
    }
}
