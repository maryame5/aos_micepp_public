package com.example.aos_backend.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Repository.StorageRepository;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DocumentUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10MB}")
    private String maxFileSizeStr;

    @Value("${app.upload.allowed-extensions}")
    private List<String> allowedExtensions;

    private Path uploadPath;

    @Autowired
    private StorageRepository storageRepository;

    @PostConstruct
    public void init() {
        // Initialiser le chemin d'upload au démarrage
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath);
            }
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", uploadPath, e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String uploadDocument(MultipartFile file) throws IOException {
        // Validation du fichier
        validateFile(file);

        // Générer un nom de fichier unique
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Créer le chemin complet du fichier
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner le nom du fichier unique pour la base de données
        log.info("File uploaded successfully: {} -> {}", originalFilename, uniqueFilename);
        return uniqueFilename;
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        long maxFileSizeBytes = parseFileSize(maxFileSizeStr);
        if (file.getSize() > maxFileSizeBytes) {
            throw new IOException("Le fichier est trop volumineux. Taille maximale: " + maxFileSizeStr);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IOException("Nom de fichier invalide");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        boolean extensionAllowed = allowedExtensions.stream()
                .anyMatch(ext -> ext.equalsIgnoreCase(fileExtension));

        if (!extensionAllowed) {
            throw new IOException("Extension de fichier non autorisée. Extensions autorisées: " + allowedExtensions);
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new IOException("Type de contenu invalide");
        }

        log.debug("File validation passed: {} ({}), size: {}, type: {}",
                originalFilename, fileExtension, formatFileSize(file.getSize()), contentType);
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    private long parseFileSize(String sizeStr) {
        if (sizeStr == null || sizeStr.trim().isEmpty()) {
            return 10 * 1024 * 1024; // 10MB par défaut
        }

        sizeStr = sizeStr.trim().toUpperCase();
        long multiplier = 1;

        if (sizeStr.endsWith("KB")) {
            multiplier = 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("MB")) {
            multiplier = 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("GB")) {
            multiplier = 1024 * 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        }

        try {
            return Long.parseLong(sizeStr.trim()) * multiplier;
        } catch (NumberFormatException e) {
            log.warn("Invalid file size format: {}, using default 10MB", sizeStr);
            return 10 * 1024 * 1024;
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024)
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    public boolean deleteDocument(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Document deleted successfully: {}", filename);
                return true;
            } else {
                log.warn("Document not found for deletion: {}", filename);
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting document: {}", filename, e);
            return false;
        }
    }

    public Path getDocumentPath(String filename) {
        return uploadPath.resolve(filename);
    }

    public boolean documentExists(String filename) {
        return Files.exists(uploadPath.resolve(filename));
    }
}