package com.example.aos_backend.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.aos_backend.Service.DocpublicService;
import com.example.aos_backend.dto.DocumentPublicDTO;
import com.example.aos_backend.user.DocumentPublic;
import com.example.aos_backend.Util.DocumentUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/documents")
@Slf4j
public class DocpublicController {

    @Autowired
    private DocpublicService documentService;

    @GetMapping("/public")
    public ResponseEntity<List<DocumentPublicDTO>> getAllPublicDocuments() {
        try {
            List<DocumentPublicDTO> documents = documentService.getAllPublicDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<DocumentPublicDTO> getPublicDocumentById(@PathVariable Long id) {
        try {
            DocumentPublicDTO document = documentService.getPublicDocumentById(id);
            if (document != null) {
                return ResponseEntity.ok(document);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        try {
            DocumentPublic document = documentService.getDocumentById(id);
            if (document != null && document.getContent() != null) {

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(document.getContentType()));
                headers.setContentDisposition(ContentDisposition.attachment()
                        .filename(document.getFileName())
                        .build());
                byte[] content = DocumentUtil.decompressDocument(document.getContent());

                return new ResponseEntity<>(content, headers, HttpStatus.OK);

            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/{id}/preview")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long id) {
        try {
            DocumentPublic document = documentService.getDocumentById(id);
            if (document != null && document.getContent() != null) {

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(document.getContentType()));
                headers.setContentDisposition(ContentDisposition.inline().build());
                byte[] content = DocumentUtil.decompressDocument(document.getContent());

                return new ResponseEntity<>(content, headers, HttpStatus.OK);

            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/{id}/image")
    public ResponseEntity<byte[]> getDocumentImage(@PathVariable Long id) {
        try {
            DocumentPublic document = documentService.getDocumentById(id);
            if (document != null && document.getContent() != null && isImageFile(document.getContentType())) {

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(document.getContentType()));
                headers.setCacheControl("max-age=86400"); // Cache for 24 hours
                byte[] content = DocumentUtil.decompressDocument(document.getContent());

                return new ResponseEntity<>(content, headers, HttpStatus.OK);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving image for document with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isImageFile(String contentType) {
        if (contentType == null)
            return false;
        return contentType.toLowerCase().startsWith("image/");
    }

    @GetMapping("/public/type/{type}")
    public ResponseEntity<List<DocumentPublicDTO>> getDocumentsByType(@PathVariable String type) {
        try {
            List<DocumentPublicDTO> documents = documentService.getDocumentsByType(type);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<DocumentPublicDTO>> searchDocuments(@RequestParam("q") String query) {
        try {
            List<DocumentPublicDTO> documents = documentService.searchDocuments(query);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}