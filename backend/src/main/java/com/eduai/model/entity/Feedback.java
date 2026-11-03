package com.eduai.model.entity;

import com.eduai.model.enums.FeedbackCategory;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(length = 150)
    private String senderEmail;

    @Column(length = 100)
    private String senderName;

    @Column(length = 300)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private FeedbackCategory category;

    @Column(length = 30)
    private String status = "OPEN";

    @Column(name = "is_email_sent", columnDefinition = "boolean default false")
    private Boolean isEmailSent = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
