package com.example.aos_backend.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DocumentUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10MB}") // 10MB par défaut
    private String maxFileSizeStr;

    @Value("${app.upload.allowed-extensions}")
    private List<String> allowedExtensions;

    public String uploadDocument(MultipartFile file) throws IOException {
        // Validation du fichier
        validateFile(file);

        // Créer le répertoire d'upload s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
        }

        // Générer un nom de fichier unique
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Créer le chemin complet du fichier
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner le chemin relatif pour la base de données
        String relativePath = uploadDir + "/" + uniqueFilename;
        log.info("File uploaded successfully: {} -> {}", originalFilename, relativePath);

        return relativePath;
    }

    private void validateFile(MultipartFile file) throws IOException {
        // Vérifier si le fichier est vide
        if (file.isEmpty()) {
            throw new IOException("Le fichier est vide");
        }

        // Vérifier la taille du fichier (convertir 10MB en bytes)
        long maxFileSizeBytes = parseFileSize(maxFileSizeStr);
        if (file.getSize() > maxFileSizeBytes) {
            throw new IOException("Le fichier est trop volumineux. Taille maximale: " + maxFileSizeStr);
        }

        // Vérifier l'extension du fichier
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new IOException("Nom de fichier invalide");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();

        boolean extensionAllowed = false;
        for (String ext : allowedExtensions) {
            // Enlever le point si présent
            String cleanExt = ext.startsWith(".") ? ext.substring(1) : ext;
            if (cleanExt.equalsIgnoreCase(fileExtension)) {
                extensionAllowed = true;
                break;
            }
        }

        if (!extensionAllowed) {
            throw new IOException("Extension de fichier non autorisée. Extensions autorisées: " + allowedExtensions);
        }

        // Vérifier le type MIME
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
            sizeStr = sizeStr.substring(0, sizeStr.length() - 3);
        }

        try {
            return Long.parseLong(sizeStr) * multiplier;
        } catch (NumberFormatException e) {
            log.warn("Invalid file size format: {}, using default 10MB", sizeStr);
            return 10 * 1024 * 1024; // 10MB par défaut
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

    // Méthode pour supprimer un document
    public boolean deleteDocument(String documentPath) {
        try {
            Path filePath = Paths.get(documentPath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Document deleted successfully: {}", documentPath);
                return true;
            } else {
                log.warn("Document not found for deletion: {}", documentPath);
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting document: {}", documentPath, e);
            return false;
        }
    }

    // Méthode pour obtenir le chemin absolu d'un document
    public Path getDocumentPath(String documentPath) {
        return Paths.get(documentPath);
    }

    // Méthode pour vérifier si un document existe
    public boolean documentExists(String documentPath) {
        return Files.exists(Paths.get(documentPath));
    }
}
