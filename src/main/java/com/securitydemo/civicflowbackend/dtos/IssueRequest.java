package com.securitydemo.civicflowbackend.dtos;

import lombok.Data;

@Data
public class IssueRequest {
    private String title;
    private String description;
    private Double latitude;
    private Double longitude;
}