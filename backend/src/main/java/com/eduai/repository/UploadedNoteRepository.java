package com.eduai.repository;

import com.eduai.model.entity.UploadedNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UploadedNoteRepository extends JpaRepository<UploadedNote, UUID> {
    List<UploadedNote> findByUploaderIdOrderByCreatedAtDesc(UUID uploaderId);
}
