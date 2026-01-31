package com.securitydemo.civicflowbackend.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    private Double latitude;
    private Double longitude;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Many Issues can belong to One User
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
}
