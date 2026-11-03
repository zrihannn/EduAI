package com.eduai.controller;

import com.eduai.model.entity.UploadedNote;
import com.eduai.service.NoteProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Note upload and processing")
public class NoteController {

    private final NoteProcessingService noteService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @Operation(summary = "Upload PPT/PDF/DOCX note file")
    public ResponseEntity<UploadedNote> uploadNote(@RequestParam("file") MultipartFile file, Authentication auth) {
        UploadedNote savedNote = noteService.uploadNote(file, auth.getName());
        noteService.processNoteAsync(savedNote.getId()); // Trigger async NLP
        return new ResponseEntity<>(savedNote, HttpStatus.CREATED);
    }

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download an uploaded note file (Local Development Fallback)")
    public ResponseEntity<Resource> downloadNote(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(System.getProperty("java.io.tmpdir")).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get all notes uploaded by current user")
    public ResponseEntity<List<UploadedNote>> getNotes(Authentication auth) {
        return ResponseEntity.ok(noteService.getNotesByUser(auth.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get note detail and status")
    public ResponseEntity<UploadedNote> getNoteById(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(noteService.getNoteById(id, auth.getName()));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Poll processing status")
    public ResponseEntity<String> getNoteStatus(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(noteService.getNoteById(id, auth.getName()).getProcessingStatus().name());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an uploaded note")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID id, Authentication auth) {
        noteService.deleteNote(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
