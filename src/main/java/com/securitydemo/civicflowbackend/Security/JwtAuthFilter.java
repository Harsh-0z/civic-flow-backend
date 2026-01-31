package com.securitydemo.civicflowbackend.Security;

import com.securitydemo.civicflowbackend.services.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/*
It intercepts every request.

It looks for Authorization: Bearer <token>.

It calls your JwtUtil to check if the token is valid.

If valid, it lets the user in.

*/
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // 1. Get the Header from the Request
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // 2. Check if the header starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cut off "Bearer " (7 chars) to get the token
            username = jwtUtil.extractUsername(token); // Extract username from token
        }

        // 3. If username exists AND the user is not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load user details from Database
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 4. Validate the token
            if (jwtUtil.validateToken(token, userDetails.getUsername())) {

                // 5. Create the "ID Card" (Authentication Token)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                //no pw because for api rq needs just token

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Hand the ID Card to Spring Security (Now the user is "Logged In")
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Continue the request (Pass to the next filter or Controller)
        filterChain.doFilter(request, response);
    }





}
