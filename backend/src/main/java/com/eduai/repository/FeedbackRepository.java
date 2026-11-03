package com.eduai.repository;

import com.eduai.model.entity.Feedback;
import com.eduai.model.enums.FeedbackCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Page<Feedback> findByStatus(String status, Pageable pageable);
    Page<Feedback> findByCategory(FeedbackCategory category, Pageable pageable);
    Page<Feedback> findByStatusAndCategory(String status, FeedbackCategory category, Pageable pageable);
}
