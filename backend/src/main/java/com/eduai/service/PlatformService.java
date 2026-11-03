package com.eduai.service;

import com.eduai.model.entity.PlatformConfig;
import com.eduai.repository.PlatformConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformService {

    private final PlatformConfigRepository platformRepository;

    public List<PlatformConfig> getAllActivePlatforms() {
        return platformRepository.findByIsActiveTrue();
    }

    public List<PlatformConfig> getPlatformsByTopic(String topic) {
        String searchTopic = topic.toLowerCase();
        return platformRepository.findByIsActiveTrue().stream()
                .filter(p -> p.getTopics() != null &&
                        (p.getTopics().contains("all")
                                || p.getTopics().stream().anyMatch(t -> t.toLowerCase().contains(searchTopic))))
                .collect(Collectors.toList());
    }

    public PlatformConfig addPlatform(PlatformConfig platform) {
        return platformRepository.save(platform);
    }
}
