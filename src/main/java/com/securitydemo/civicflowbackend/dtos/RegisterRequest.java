package com.securitydemo.civicflowbackend.dtos;

import com.securitydemo.civicflowbackend.entities.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private Role role;       // "CITIZEN", "OFFICIAL", "ADMIN"
    private String department; // Optional (only for Officials)
}