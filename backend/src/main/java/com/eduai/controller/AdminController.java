package com.eduai.controller;

import com.eduai.model.dto.StatsDto;
import com.eduai.model.entity.CourseRecommendation;
import com.eduai.model.entity.User;
import com.eduai.repository.CourseRecommendationRepository;
import com.eduai.repository.FeedbackRepository;
import com.eduai.repository.UserRepository;
import com.eduai.repository.UserSearchRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and core entity management")
public class AdminController {

    private final UserRepository userRepository;
    private final UserSearchRepository searchRepository;
    private final FeedbackRepository feedbackRepository;
    private final CourseRecommendationRepository courseRepo;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard stats")
    public ResponseEntity<StatsDto> getStats() {
        long users = userRepository.count();
        // searches today (stubbed for scale, assumes basic count of all for hackathon
        // if no complex date query)
        long searches = searchRepository.count();

        long feedbacks = feedbackRepository.findAll().stream().filter(f -> f.getStatus().equals("OPEN")).count();
        long coursesCount = courseRepo.count();

        StatsDto stats = StatsDto.builder()
                .totalUsers(users)
                .searchesToday(searches)
                .openFeedbacks(feedbacks)
                .totalCourses(coursesCount)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "List users for admin management")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/courses")
    @Operation(summary = "Manually add a course recommendation")
    public ResponseEntity<CourseRecommendation> addCourse(@RequestBody CourseRecommendation recommendation) {
        return new ResponseEntity<>(courseRepo.save(recommendation), HttpStatus.CREATED);
    }

    @DeleteMapping("/courses/{id}")
    @Operation(summary = "Remove a course recommendation")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID id) {
        courseRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
