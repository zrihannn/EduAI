package com.eduai.controller;

import com.eduai.model.dto.ChatRequest;
import com.eduai.model.dto.ChatResponse;
import com.eduai.model.entity.AIChatHistory;
import com.eduai.service.AITeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Teacher", description = "AI chat interface for students")
public class AITeacherController {

    private final AITeacherService aiTeacherService;

    @PostMapping("/chat")
    @Operation(summary = "Send message to AI Teacher")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request, Authentication auth) {
        return ResponseEntity.ok(aiTeacherService.chat(request, auth.getName()));
    }

    @GetMapping("/chat/history/{sessionId}")
    @Operation(summary = "Get chat history for a session")
    public ResponseEntity<List<AIChatHistory>> getSessionHistory(@PathVariable UUID sessionId, Authentication auth) {
        return ResponseEntity.ok(aiTeacherService.getSessionHistory(sessionId, auth.getName()));
    }

    @DeleteMapping("/chat/history/{sessionId}")
    @Operation(summary = "Clear session history")
    public ResponseEntity<Void> clearSessionHistory(@PathVariable UUID sessionId) {
        aiTeacherService.clearHistory(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/models")
    @Operation(summary = "List available AI models")
    public ResponseEntity<List<String>> getModels() {
        return ResponseEntity.ok(aiTeacherService.getAvailableModels());
    }
}
