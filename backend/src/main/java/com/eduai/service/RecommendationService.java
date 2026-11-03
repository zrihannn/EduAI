package com.eduai.service;

import com.eduai.exception.EntityNotFoundException;
import com.eduai.model.entity.CourseRecommendation;
import com.eduai.model.entity.UploadedNote;
import com.eduai.model.entity.User;
import com.eduai.model.enums.CourseType;
import com.eduai.model.enums.Platform;
import com.eduai.repository.CourseRecommendationRepository;
import com.eduai.repository.SavedCourseRepository;
import com.eduai.model.entity.SavedCourse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecommendationService {

    private final CourseRecommendationRepository recommendationRepository;
    private final SavedCourseRepository savedCourseRepository;
    private final UserService userService;
    private final NoteProcessingService noteService;

    public Page<CourseRecommendation> search(String query, String type, String platform, Pageable pageable) {
        // Normalize filter values - treat "ALL" or empty strings as null
        Platform platformEnum = null;
        if (platform != null && !platform.isEmpty() && !platform.equalsIgnoreCase("ALL")) {
            try {
                platformEnum = Platform.valueOf(platform.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid platform filter: {}", platform);
            }
        }

        CourseType typeEnum = null;
        if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("ALL")) {
            try {
                typeEnum = CourseType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid type filter: {}", type);
            }
        }

        try {
            return findWithFilters(query, platformEnum, typeEnum, pageable);
        } catch (Exception e) {
            log.error("Search failed", e);
            return Page.empty(pageable);
        }
    }

    private Page<CourseRecommendation> findWithFilters(String query, Platform platform, CourseType type,
            Pageable pageable) {
        List<CourseRecommendation> all = recommendationRepository.searchByTextList(query, platform, type);

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());

        List<CourseRecommendation> pageContent = (start >= all.size()) ? List.of() : all.subList(start, end);
        return new PageImpl<>(pageContent, pageable, all.size());
    }

    @Cacheable(value = "trendingCourses", key = "'all'", sync = true)
    public List<CourseRecommendation> getTrending() {
        return recommendationRepository.findTop20ByIsActiveTrueOrderByRelevanceScoreDesc();
    }

    public CourseRecommendation getRecommendationById(UUID id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course recommendation not found"));
    }

    public List<CourseRecommendation> searchByNote(UUID noteId, String email) {
        UploadedNote note = noteService.getNoteById(noteId, email);
        List<String> topics = note.getExtractedTopics();

        if (topics == null || topics.isEmpty()) {
            return recommendationRepository.findTop20ByIsActiveTrueOrderByRelevanceScoreDesc();
        }

        // Simplistic keyword matching for the demo
        String combinedQuery = String.join(" ", topics);
        return recommendationRepository.searchByTextList(combinedQuery, null, null);
    }

    public void saveToUserList(String email, UUID recommendationId) {
        User user = userService.getCurrentUserEntity(email);
        CourseRecommendation rec = getRecommendationById(recommendationId);

        if (!savedCourseRepository.existsByUserIdAndRecommendationId(user.getId(), recommendationId)) {
            SavedCourse saved = SavedCourse.builder()
                    .user(user)
                    .recommendation(rec)
                    .build();
            savedCourseRepository.save(saved);
        }
    }

    public void removeFromUserList(String email, UUID recommendationId) {
        User user = userService.getCurrentUserEntity(email);
        savedCourseRepository.deleteByUserIdAndRecommendationId(user.getId(), recommendationId);
    }

    public List<CourseRecommendation> getSavedRecommendations(String email) {
        User user = userService.getCurrentUserEntity(email);
        return savedCourseRepository.findByUserId(user.getId()).stream()
                .map(SavedCourse::getRecommendation)
                .collect(Collectors.toList());
    }
}
