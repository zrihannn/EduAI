package com.eduai.repository;

import com.eduai.model.entity.SavedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedCourseRepository extends JpaRepository<SavedCourse, UUID> {
    List<SavedCourse> findByUserId(UUID userId);

    List<SavedCourse> findByUserIdOrderBySavedAtDesc(UUID userId);

    Optional<SavedCourse> findByUserIdAndRecommendationId(UUID userId, UUID recommendationId);

    boolean existsByUserIdAndRecommendationId(UUID userId, UUID recommendationId);

    @Transactional
    void deleteByUserIdAndRecommendationId(UUID userId, UUID recommendationId);
}
