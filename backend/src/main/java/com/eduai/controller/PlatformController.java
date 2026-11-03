package com.eduai.controller;

import com.eduai.model.entity.PlatformConfig;
import com.eduai.service.PlatformService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platforms")
@RequiredArgsConstructor
@Tag(name = "Platforms", description = "Manage Supported Course Platforms")
public class PlatformController {

    private final PlatformService platformService;

    @GetMapping
    @Operation(summary = "Get all active platforms")
    public ResponseEntity<List<PlatformConfig>> getAllPlatforms() {
        return ResponseEntity.ok(platformService.getAllActivePlatforms());
    }

    @GetMapping("/by-topic")
    @Operation(summary = "Get recommended platforms for a given topic")
    public ResponseEntity<List<PlatformConfig>> getPlatformsByTopic(@RequestParam String topic) {
        return ResponseEntity.ok(platformService.getPlatformsByTopic(topic));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new platform (ADMIN ONLY)")
    public ResponseEntity<PlatformConfig> addPlatform(@Valid @RequestBody PlatformConfig platform) {
        return new ResponseEntity<>(platformService.addPlatform(platform), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update platform config (ADMIN ONLY)")
    public ResponseEntity<PlatformConfig> updatePlatform(@PathVariable java.util.UUID id,
            @RequestBody PlatformConfig platform) {
        // Assume basic ID set and replace action
        platform.setId(id);
        return ResponseEntity.ok(platformService.addPlatform(platform));
    }
}
