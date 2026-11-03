package com.eduai.repository;

import com.eduai.model.entity.AIChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AIChatHistoryRepository extends JpaRepository<AIChatHistory, UUID> {
    List<AIChatHistory> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
    void deleteBySessionId(UUID sessionId);
}
