package com.eduai.repository;

import com.eduai.model.entity.PlatformConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformConfigRepository extends JpaRepository<PlatformConfig, UUID> {
    Optional<PlatformConfig> findByPlatformIgnoreCase(String platform);
    List<PlatformConfig> findByIsActiveTrue();
}
