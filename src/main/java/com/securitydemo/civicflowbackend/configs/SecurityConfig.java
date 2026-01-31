package com.securitydemo.civicflowbackend.configs;

import com.securitydemo.civicflowbackend.Security.JwtAuthFilter;
import com.securitydemo.civicflowbackend.services.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter  jwtAuthFilter;

    private final CustomUserDetailsService userDetailsService;

    // THE SECURITY CHAIN (RULES)

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF (Because we use JWT, not Session Cookies)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                //  Define URL Permissions
                .authorizeHttpRequests(auth -> auth
                        // Public Routes (Login/Register) - Everyone allowed
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Admin Routes - Only ADMIN role allowed
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // Official Routes -Only Officials/Admins can update status
                        .requestMatchers(HttpMethod.PUT, "/issues/**").hasAnyRole("OFFICIAL", "ADMIN")

                        // All other routes (e.g., /my-reports) - Must be logged in
                        .anyRequest().authenticated()
                )

                //Make it STATELESS (No Session Cookies stored in RAM)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Set the Authentication Provider (Connects to DB)
                .authenticationProvider(authenticationProvider())

                // Add our JWT Filter BEFORE the standard UsernamePassword Filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Bean to encrypt passwords (We never store plain text passwords!)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean to connect Spring Security to our CustomUserDetailsService
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // Bean to allow us to manually login users in the Controller
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        //  Who can access? (Frontend Ports)

        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "http://localhost:5500"));

        //  What methods are allowed?
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        //  ALLOW THE JWT HEADER (Critical!)
        // If you don't add "Authorization", the frontend cannot send the token.
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // Apply to all URLs
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}

