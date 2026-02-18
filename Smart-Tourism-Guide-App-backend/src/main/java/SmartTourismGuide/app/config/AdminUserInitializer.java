package SmartTourismGuide.app.config;

import SmartTourismGuide.app.enums.Role;
import SmartTourismGuide.app.entity.User;
import SmartTourismGuide.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminUser();
    }

    private void createAdminUser() {
        String adminUsername = "admin";
        String adminEmail = "admin@smarttourism.com";
        String adminPassword = "Admin@123";

        // Check if admin user already exists
        if (userRepository.existsByUsername(adminUsername)) {
            log.info("Admin user already exists. Skipping creation.");
            return;
        }

        // Create admin user
        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setFirstName("System");
        admin.setLastName("Administrator");

        userRepository.save(admin);

        log.info("Admin user created successfully!");
        log.info("   Username: {}", adminUsername);
        log.info("   Email: {}", adminEmail);
        log.info("   Password: {}", adminPassword);
        log.info("   IMPORTANT: Change the password after first login!");

    }
}
