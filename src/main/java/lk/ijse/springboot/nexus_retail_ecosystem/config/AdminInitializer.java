package lk.ijse.springboot.nexus_retail_ecosystem.config;

import lk.ijse.springboot.nexus_retail_ecosystem.entity.Role;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.User;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Pulling values from application.properties
    @Value("${nexus.default.admin.username}")
    private String adminUsername;

    @Value("${nexus.default.admin.password}")
    private String adminPassword;

    @Value("${nexus.default.admin.email}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            System.out.println(">>> Default Admin created securely!");
        }
    }
}