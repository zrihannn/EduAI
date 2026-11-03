package com.eduai.controller;

import com.eduai.model.dto.FeedbackRequest;
import com.eduai.model.entity.Feedback;
import com.eduai.model.enums.FeedbackCategory;
import com.eduai.service.FeedbackService;
import com.eduai.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Submit and manage application feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Submit feedback")
    public ResponseEntity<Feedback> submitFeedback(@Valid @RequestBody FeedbackRequest request, Authentication auth) {
        Feedback feedback = Feedback.builder()
                .senderName(request.getSenderName())
                .senderEmail(request.getSenderEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .category(request.getCategory())
                .status("OPEN")
                .isEmailSent(false)
                .build();

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            feedback.setUser(userService.getCurrentUserEntity(auth.getName()));
            if (feedback.getSenderEmail() == null) {
                feedback.setSenderEmail(auth.getName());
            }
        }

        return new ResponseEntity<>(feedbackService.submitFeedback(feedback), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List feedbacks (ADMIN only)")
    public ResponseEntity<Page<Feedback>> getFeedbacks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) FeedbackCategory category,
            Pageable pageable) {
        return ResponseEntity.ok(feedbackService.getFeedbacks(status, category, pageable));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update feedback status (ADMIN only)")
    public ResponseEntity<Feedback> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(feedbackService.updateStatus(id, status));
    }
}
