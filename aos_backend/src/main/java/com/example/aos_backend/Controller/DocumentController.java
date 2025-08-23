package com.example.aos_backend.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
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
@Tag(name = "Document Controller", description = "Controller for serving uploaded documents")
@Slf4j
public class DocumentController {

    private final DocumentUploadService documentUploadService;

    @Value("${app.upload.dir:/uploads}")
    private String uploadDir;

    @GetMapping("/{filename:.+}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download document", description = "Download a document by filename")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String filename) {
        try {
            // Construire le chemin complet du fichier
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            // Vérifier que le fichier existe
            if (!Files.exists(filePath)) {
                log.warn("Document not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Créer la ressource
            Resource resource = new UrlResource(filePath.toUri());

            // Déterminer le type MIME
            String contentType = determineContentType(filename);

            // Construire la réponse
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("Error serving document: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{filename:.+}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Force download document", description = "Force download a document by filename")
    public ResponseEntity<Resource> forceDownloadDocument(@PathVariable String filename) {
        try {
            // Construire le chemin complet du fichier
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            // Vérifier que le fichier existe
            if (!Files.exists(filePath)) {
                log.warn("Document not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Créer la ressource
            Resource resource = new UrlResource(filePath.toUri());

            // Construire la réponse avec téléchargement forcé
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("Error serving document: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();

        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "txt":
                return "text/plain";
            default:
                return "application/octet-stream";
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }
}
