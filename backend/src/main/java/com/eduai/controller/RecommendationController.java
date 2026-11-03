package com.eduai.controller;

import com.eduai.model.entity.CourseRecommendation;
import com.eduai.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Course search and recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/search")
    @Operation(summary = "Main search for course recommendations")
    public ResponseEntity<Page<CourseRecommendation>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(required = false) String platform,
            Pageable pageable) {
        return ResponseEntity.ok(recommendationService.search(query, type, platform, pageable));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending courses")
    public ResponseEntity<List<CourseRecommendation>> getTrending() {
        return ResponseEntity.ok(recommendationService.getTrending());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single recommendation detail")
    public ResponseEntity<CourseRecommendation> getRecommendationById(@PathVariable UUID id) {
        return ResponseEntity.ok(recommendationService.getRecommendationById(id));
    }

    @GetMapping("/by-note/{noteId}")
    @Operation(summary = "Get recommendations based on uploaded note")
    public ResponseEntity<List<CourseRecommendation>> getByNote(@PathVariable UUID noteId, Authentication auth) {
        return ResponseEntity.ok(recommendationService.searchByNote(noteId, auth.getName()));
    }

    @PostMapping("/save/{id}")
    @Operation(summary = "Save a course recommendation")
    public ResponseEntity<Void> saveRecommendation(@PathVariable UUID id, Authentication auth) {
        recommendationService.saveToUserList(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/save/{id}")
    @Operation(summary = "Remove a saved course recommendation")
    public ResponseEntity<Void> removeSavedRecommendation(@PathVariable UUID id, Authentication auth) {
        recommendationService.removeFromUserList(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/saved")
    @Operation(summary = "Get saved course recommendations")
    public ResponseEntity<List<CourseRecommendation>> getSavedRecommendations(Authentication auth) {
        return ResponseEntity.ok(recommendationService.getSavedRecommendations(auth.getName()));
    }
}
