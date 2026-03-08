package lk.ijse.springboot.nexus_retail_ecosystem.service;

import lk.ijse.springboot.nexus_retail_ecosystem.dto.AuthenticationRequest;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.AuthenticationResponse;
import lk.ijse.springboot.nexus_retail_ecosystem.dto.RegisterRequest;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.Role;
import lk.ijse.springboot.nexus_retail_ecosystem.entity.User;
import lk.ijse.springboot.nexus_retail_ecosystem.exception.DuplicateResourceException;
import lk.ijse.springboot.nexus_retail_ecosystem.repository.UserRepository;
import lk.ijse.springboot.nexus_retail_ecosystem.util.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // --- SIGN UP LOGIC ---
    public AuthenticationResponse register(RegisterRequest request) {
        // 1. Check for duplicates before doing anything else
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered!");
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(user);

        // TRANSLATION: Convert your User to Spring Security's UserDetails
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name()) // Automatically adds the "ROLE_" prefix
                .build();

        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        // Now it accepts it perfectly!
        var jwtToken = jwtService.generateToken(userDetails);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // --- SIGN IN LOGIC ---
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(()-> new UsernameNotFoundException("User not found with username: "+request.getUsername()));

        // TRANSLATION: Convert your User to Spring Security's UserDetails
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        // Generate the token
        var jwtToken = jwtService.generateToken(userDetails);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())//to grab the user role from the database
                .build();
    }
}