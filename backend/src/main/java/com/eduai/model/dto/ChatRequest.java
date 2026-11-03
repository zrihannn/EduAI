package com.eduai.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class ChatRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    private String model = "gpt-4o";
}
