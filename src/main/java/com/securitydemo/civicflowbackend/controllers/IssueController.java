package com.securitydemo.civicflowbackend.controllers;

import com.securitydemo.civicflowbackend.dtos.IssueRequest;
import com.securitydemo.civicflowbackend.entities.IssueStatus;
import com.securitydemo.civicflowbackend.services.CloudinaryService;
import com.securitydemo.civicflowbackend.services.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {


    private final IssueService issueService;

    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<?> reportIssue(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "image", required = false) MultipartFile file
    ){
        String imageUrl = null;


        if (file != null && !file.isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(file);
        }

        // Save to DB
        return ResponseEntity.ok(issueService.createIssue(title, description, latitude, longitude, imageUrl));



    }

    @GetMapping
    public ResponseEntity<?> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyIssues() {
        return ResponseEntity.ok(issueService.getMyIssues());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam IssueStatus status) {
        return ResponseEntity.ok(issueService.updateStatus(id, status));
    }

}