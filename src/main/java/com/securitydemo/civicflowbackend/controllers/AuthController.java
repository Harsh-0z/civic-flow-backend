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

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private final UserRepository userRepository;


    private final PasswordEncoder passwordEncoder;


    private final JwtUtil jwtUtil;


    private final AuthenticationManager authenticationManager;

    //  REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if user exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
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

    //LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            // This verifies the username and password against the DB
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // If we get here, the user is valid. Generate Token.
        String token = jwtUtil.generateToken(request.getEmail());

        return ResponseEntity.ok(new AuthResponse(token));
    }
}