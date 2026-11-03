package com.eduai.service;

import com.eduai.exception.EntityNotFoundException;
import com.eduai.exception.FileSizeExceededException;
import com.eduai.model.entity.UploadedNote;
import com.eduai.model.entity.User;
import com.eduai.model.enums.ProcessingStatus;
import com.eduai.repository.UploadedNoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoteProcessingService {

    private final UploadedNoteRepository noteRepository;
    private final UserService userService;
    private final S3Client s3Client;

    @Value("${app.s3.bucket}")
    private String bucketName;

    @Value("${app.s3.region}")
    private String region;

    @Value("${app.python-ai.url}")
    private String pythonAiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public UploadedNote uploadNote(MultipartFile file, String email) {
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new FileSizeExceededException("File size exceeds 50MB limit");
        }

        User uploader = userService.getCurrentUserEntity(email);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getExtension(originalFilename);

        if (!List.of("pdf", "pptx", "docx", "txt").contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Use pdf, pptx, docx, or txt.");
        }

        String fileName = UUID.randomUUID() + "_" + originalFilename;

        try {
            Path targetLocation = Paths.get(System.getProperty("java.io.tmpdir")).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://backend:8080/api/v1/notes/download/" + fileName;

            UploadedNote note = UploadedNote.builder()
                    .uploader(uploader)
                    .fileName(originalFilename)
                    .fileUrl(fileUrl)
                    .fileType(extension)
                    .processingStatus(ProcessingStatus.PENDING)
                    .build();

            return noteRepository.save(note);

        } catch (Exception e) {
            log.error("Failed to upload file to S3", e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    private void uploadToS3(String fileName, MultipartFile file) throws IOException {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    @Async
    @Transactional
    public void processNoteAsync(UUID noteId) {
        UploadedNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));

        note.setProcessingStatus(ProcessingStatus.PROCESSING);
        noteRepository.save(note);

        try {
            String url = pythonAiBaseUrl + "/extract-topics";
            Map<String, String> payload = new HashMap<>();
            payload.put("file_url", note.getFileUrl());
            payload.put("file_type", note.getFileType());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                List<String> topics = (List<String>) body.get("topics");
                String summary = (String) body.get("summary");

                note.setExtractedTopics(topics);
                note.setExtractedText(summary);
                note.setProcessingStatus(ProcessingStatus.DONE);
            } else {
                note.setProcessingStatus(ProcessingStatus.FAILED);
            }
        } catch (Exception e) {
            log.error("Failed to process note through AI service", e);
            note.setProcessingStatus(ProcessingStatus.FAILED);
        }

        noteRepository.save(note);
    }

    public List<UploadedNote> getNotesByUser(String email) {
        User user = userService.getCurrentUserEntity(email);
        return noteRepository.findByUploaderIdOrderByCreatedAtDesc(user.getId());
    }

    public UploadedNote getNoteById(UUID noteId, String email) {
        // Checking ownership or admin access ideally
        User user = userService.getCurrentUserEntity(email);
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
    }

    public void deleteNote(UUID noteId, String email) {
        User user = userService.getCurrentUserEntity(email);
        UploadedNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));

        // Validation for ownership goes here if needed.
        noteRepository.delete(note);
    }
}
