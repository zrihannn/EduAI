package com.eduai.service;

import com.eduai.model.entity.Feedback;
import com.eduai.model.enums.FeedbackCategory;
import com.eduai.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EmailService emailService;

    public Feedback submitFeedback(Feedback feedback) {
        Feedback saved = feedbackRepository.save(feedback);

        // Send email asynchronously
        emailService.sendFeedbackEmail(saved);

        saved.setIsEmailSent(true);
        return feedbackRepository.save(saved);
    }

    public Page<Feedback> getFeedbacks(String status, FeedbackCategory category, Pageable pageable) {
        if (status != null && category != null) {
            return feedbackRepository.findByStatusAndCategory(status, category, pageable);
        } else if (status != null) {
            return feedbackRepository.findByStatus(status, pageable);
        } else if (category != null) {
            return feedbackRepository.findByCategory(category, pageable);
        }
        return feedbackRepository.findAll(pageable);
    }

    public Feedback updateStatus(UUID id, String status) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
        feedback.setStatus(status);
        return feedbackRepository.save(feedback);
    }
}
