package com.securitydemo.civicflowbackend.controllers;

import com.securitydemo.civicflowbackend.entities.User;
import com.securitydemo.civicflowbackend.repositories.IssueRepository;
import com.securitydemo.civicflowbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final IssueRepository issueRepository;

    // Get all users (for admin panel)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        // Map to DTOs to avoid exposing passwords
        List<Map<String, Object>> userDtos = users.stream().map(user -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", user.getId());
            dto.put("email", user.getEmail());
            dto.put("role", user.getRole().name());
            dto.put("department", user.getDepartment());
            return dto;
        }).toList();

        return ResponseEntity.ok(userDtos);
    }

    // Delete a user (officials/citizens, not admin)
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Prevent deleting ADMIN users
        if (user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.badRequest().body("Cannot delete admin users");
        }

        // First delete all issues reported by this user
        issueRepository.deleteByReporter(user);

        // Then delete the user
        userRepository.delete(user);
        return ResponseEntity.ok("User deleted successfully");
    }
}
