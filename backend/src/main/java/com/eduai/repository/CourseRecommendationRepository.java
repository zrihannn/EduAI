package com.eduai.repository;

import com.eduai.model.entity.CourseRecommendation;
import com.eduai.model.enums.CourseType;
import com.eduai.model.enums.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRecommendationRepository extends JpaRepository<CourseRecommendation, UUID> {

        @Query("SELECT cr FROM CourseRecommendation cr WHERE " +
                        "(:platform IS NULL OR cr.platform = :platform) " +
                        "AND (:courseType IS NULL OR cr.courseType = :courseType) " +
                        "AND (:query IS NULL OR :query = '' OR (" +
                        "     LOWER(cr.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(cr.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "     OR LOWER(cr.instructor) LIKE LOWER(CONCAT('%', :query, '%')))) " +
                        "ORDER BY cr.relevanceScore DESC")
        List<CourseRecommendation> searchByTextList(@Param("query") String query,
                        @Param("platform") Platform platform,
                        @Param("courseType") CourseType courseType);

        List<CourseRecommendation> findTop20ByIsActiveTrueOrderByRelevanceScoreDesc();

        @Query(value = "SELECT * FROM course_recommendations cr WHERE cr.platform = :platform AND cr.course_type = :courseType", nativeQuery = true)
        List<CourseRecommendation> findByPlatformAndCourseType(@Param("platform") String platform,
                        @Param("courseType") String courseType);
}
