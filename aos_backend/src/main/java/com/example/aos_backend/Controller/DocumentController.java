package com.example.aos_backend.Controller;

import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.DocumentService;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DocumentDTO;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.Utilisateur;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = { "http://localhost:4201", "*" })
@RequiredArgsConstructor
@Tag(name = "Document Controller", description = "Controller for managing user documents")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentDTO>> getUserDocuments() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            List<DocumentDTO> documents = documentService.getDocumentsByUserEmail(userEmail);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByUserId(@PathVariable Integer userId) {
        try {
            // Vérifier si l'utilisateur connecté peut accéder aux documents de cet
            // utilisateur
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            // Ici vous pouvez ajouter une vérification de permissions si nécessaire
            List<DocumentDTO> documents = documentService.getDocumentsByUserId(userId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            DocumentJustificatif document = documentService.getDocumentById(documentId, userEmail);

            if (document == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(document.getContentType()));
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename(document.getFileName())
                            .build());

            byte[] content = DocumentUtil.decompressDocument(document.getContent());
            return new ResponseEntity<>(content, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{documentId}/preview")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long documentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            DocumentJustificatif document = documentService.getDocumentById(documentId, userEmail);

            if (document == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(document.getContentType()));
            headers.setContentDisposition(ContentDisposition.inline().build());

            byte[] content = DocumentUtil.decompressDocument(document.getContent());
            return new ResponseEntity<>(content, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/categories")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getDocumentCategories() {
        List<String> categories = documentService.getDocumentCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getDocumentTypes() {
        List<String> types = documentService.getDocumentTypes();
        return ResponseEntity.ok(types);
    }
}