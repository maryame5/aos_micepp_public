package com.example.aos_backend.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.DocumentUploadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Document View Controller", description = "Controller for viewing and downloading documents")
@Slf4j
public class DocumentViewController {

    private final DocumentUploadService documentUploadService;

    @GetMapping("/view/{fileName}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "View a document", description = "View a document in the browser")
    public ResponseEntity<Resource> viewDocument(@PathVariable String fileName) {
        try {
            Path documentPath = documentUploadService.getDocumentPath(fileName);

            if (!documentUploadService.documentExists(fileName)) {
                log.warn("Document not found: {}", fileName);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(documentPath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Document not readable: {}", fileName);
                return ResponseEntity.notFound().build();
            }

            // Déterminer le type de contenu
            String contentType = Files.probeContentType(documentPath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            log.info("Serving document for view: {} with content type: {}", fileName, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + getOriginalFileName(fileName) + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving document for view: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{fileName}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download a document", description = "Download a document as attachment")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String fileName) {
        try {
            Path documentPath = documentUploadService.getDocumentPath(fileName);

            if (!documentUploadService.documentExists(fileName)) {
                log.warn("Document not found: {}", fileName);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(documentPath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Document not readable: {}", fileName);
                return ResponseEntity.notFound().build();
            }

            // Déterminer le type de contenu
            String contentType = Files.probeContentType(documentPath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            log.info("Serving document for download: {} with content type: {}", fileName, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + getOriginalFileName(fileName) + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving document for download: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check/{fileName}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if document exists", description = "Check if a document exists on the server")
    public ResponseEntity<Void> checkDocument(@PathVariable String fileName) {
        try {
            if (documentUploadService.documentExists(fileName)) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error checking document: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Méthode pour récupérer le nom original du fichier (si nécessaire)
    private String getOriginalFileName(String fileName) {
        // Si vous stockez le nom original dans la base de données, récupérez-le ici
        // Sinon, utilisez le nom du fichier tel quel
        return fileName;
    }
}