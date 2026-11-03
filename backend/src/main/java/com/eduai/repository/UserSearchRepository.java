package com.eduai.repository;

import com.eduai.model.entity.UserSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSearchRepository extends JpaRepository<UserSearch, UUID> {
    List<UserSearch> findTop10ByUserIdOrderBySearchedAtDesc(UUID userId);
}
