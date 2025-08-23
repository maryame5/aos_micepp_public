package com.example.aos_backend.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Service.DocumentUploadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "Document Upload Controller", description = "Controller for uploading documents")
@Slf4j
public class DocumentUploadController {

    private final DocumentUploadService documentUploadService;

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload multiple documents", description = "Upload multiple documents and return their paths")
    public ResponseEntity<UploadResponse> uploadDocuments(@RequestParam("documents") MultipartFile[] files) {
        try {
            log.info("Received upload request for {} files", files.length);

            List<String> documentPaths = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String documentPath = documentUploadService.uploadDocument(file);
                    documentPaths.add(documentPath);
                    log.info("Successfully uploaded file: {} to path: {}", file.getOriginalFilename(), documentPath);
                }
            }

            UploadResponse response = new UploadResponse(true, documentPaths,
                    String.format("Successfully uploaded %d documents", documentPaths.size()));

            log.info("Upload completed successfully. Document paths: {}", documentPaths);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during document upload", e);
            UploadResponse errorResponse = new UploadResponse(false, new ArrayList<>(),
                    "Error uploading documents: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Classe interne pour la réponse
    public static class UploadResponse {
        private boolean success;
        private List<String> documentPaths;
        private String message;

        public UploadResponse(boolean success, List<String> documentPaths, String message) {
            this.success = success;
            this.documentPaths = documentPaths;
            this.message = message;
        }

        // Getters et Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public List<String> getDocumentPaths() {
            return documentPaths;
        }

        public void setDocumentPaths(List<String> documentPaths) {
            this.documentPaths = documentPaths;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
