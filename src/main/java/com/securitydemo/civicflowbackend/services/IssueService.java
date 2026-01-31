package com.securitydemo.civicflowbackend.services;

import com.securitydemo.civicflowbackend.entities.Issue;
import com.securitydemo.civicflowbackend.entities.IssueStatus;
import com.securitydemo.civicflowbackend.entities.User;
import com.securitydemo.civicflowbackend.repositories.IssueRepository;
import com.securitydemo.civicflowbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;

    private final UserRepository userRepository;

    // Create a new Issue
    public Issue createIssue(String title, String description, Double lat, Double lng, String imageUrl) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User reporter = userRepository.findByEmail(email).orElseThrow();

        Issue issue = new Issue();
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setLatitude(lat);
        issue.setLongitude(lng);
        issue.setStatus(IssueStatus.OPEN);
        issue.setReporter(reporter);
        issue.setImageUrl(imageUrl); // <--- Set the URL!

        return issueRepository.save(issue);
    }

    // Get All Issues (For the Map)
    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    // Get My Issues (For Profile)
    public List<Issue> getMyIssues() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return issueRepository.findByReporter(user);
    }

    // update status for the admin
    public Issue updateStatus(Long issueId, IssueStatus newStatus) {
        // Find the issue
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issue.setStatus(newStatus);
        return issueRepository.save(issue);
    }
}