package com.securitydemo.civicflowbackend.controllers;

import com.securitydemo.civicflowbackend.Security.JwtUtil;
import com.securitydemo.civicflowbackend.dtos.AuthRequest;
import com.securitydemo.civicflowbackend.dtos.AuthResponse;
import com.securitydemo.civicflowbackend.dtos.RegisterRequest;
import com.securitydemo.civicflowbackend.entities.User;
import com.securitydemo.civicflowbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import com.securitydemo.civicflowbackend.entities.Role;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.admin-secret}")
    private String ADMIN_SECRET;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    // REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if user exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        if (request.getRole() == Role.ADMIN || request.getRole() == Role.OFFICIAL) {
            if (!ADMIN_SECRET.equals(request.getAdminToken())) {
                return ResponseEntity.status(403)
                        .body("Nice try! You need the Admin Token to register with this role.");
            }
        }

        // Create new User
        User user = new User();
        user.setEmail(request.getEmail());
        // CRITICAL: Encode password before saving!
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment());

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // This verifies the username and password against the DB
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // Fetch user to get their role
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate token with role included
        String token = jwtUtil.generateToken(request.getEmail(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(token));
    }
}