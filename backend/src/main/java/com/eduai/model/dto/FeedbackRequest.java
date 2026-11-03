package com.eduai.model.dto;

import com.eduai.model.enums.FeedbackCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {
    private String senderName;
    private String senderEmail;
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Category is required")
    private FeedbackCategory category;
}
