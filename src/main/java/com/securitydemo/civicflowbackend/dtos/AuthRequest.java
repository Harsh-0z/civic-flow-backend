package com.securitydemo.civicflowbackend.dtos;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
