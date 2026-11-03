package com.eduai.service;

import com.eduai.exception.EntityNotFoundException;
import com.eduai.model.dto.ChatRequest;
import com.eduai.model.dto.ChatResponse;
import com.eduai.model.entity.AIChatHistory;
import com.eduai.model.entity.User;
import com.eduai.repository.AIChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AITeacherService {

    private final AIChatHistoryRepository chatHistoryRepository;
    private final UserService userService;

    @Value("${app.python-ai.url}")
    private String pythonAiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public ChatResponse chat(ChatRequest request, String email) {
        User user = userService.getCurrentUserEntity(email);
        UUID sessionId = UUID.fromString(request.getSessionId());

        // Save User Message
        AIChatHistory userMessage = AIChatHistory.builder()
                .user(user)
                .sessionId(sessionId)
                .role("user")
                .message(request.getMessage())
                .modelUsed(request.getModel())
                .build();
        chatHistoryRepository.save(userMessage);

        // Fetch Session History for Context
        List<Map<String, String>> history = chatHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream().map(h -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("role", h.getRole());
                    map.put("content", h.getMessage());
                    return map;
                })
                .collect(Collectors.toList());

        // Build Payload for Python Service
        Map<String, Object> payload = new HashMap<>();
        payload.put("message", request.getMessage());
        payload.put("history", history);
        payload.put("model", request.getModel() == null ? "gpt-4o" : request.getModel());

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload);
            String url = pythonAiBaseUrl + "/ai-chat";
            ResponseEntity<ChatResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity,
                    ChatResponse.class);

            ChatResponse chatResponse = response.getBody();

            if (chatResponse != null) {
                // Save AI Response
                AIChatHistory aiMessage = AIChatHistory.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .role("assistant")
                        .message(chatResponse.getResponse())
                        .modelUsed(chatResponse.getModel())
                        .tokensUsed(chatResponse.getTokensUsed())
                        .build();
                chatHistoryRepository.save(aiMessage);

                return chatResponse;
            } else {
                return getDefaultFallbackResponse(user, sessionId, request.getModel());
            }

        } catch (Exception e) {
            log.error("Error communicating with Python AI Service", e);
            return getDefaultFallbackResponse(user, sessionId, request.getModel());
        }
    }

    public List<AIChatHistory> getSessionHistory(UUID sessionId, String email) {
        User user = userService.getCurrentUserEntity(email);
        // Add auth check here if desired
        return chatHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void clearHistory(UUID sessionId) {
        chatHistoryRepository.deleteBySessionId(sessionId);
    }

    public List<String> getAvailableModels() {
        return List.of("gpt-4o", "gemini-1.5-pro", "claude-3-sonnet-20240229");
    }

    private ChatResponse getDefaultFallbackResponse(User user, UUID sessionId, String model) {
        String msg = "Sorry, I am currently unable to connect to the AI model. Please try again later.";
        AIChatHistory aiMessage = AIChatHistory.builder()
                .user(user)
                .sessionId(sessionId)
                .role("assistant")
                .message(msg)
                .modelUsed(model)
                .build();
        chatHistoryRepository.save(aiMessage);

        return ChatResponse.builder()
                .response(msg)
                .model(model)
                .tokensUsed(0)
                .build();
    }
}
