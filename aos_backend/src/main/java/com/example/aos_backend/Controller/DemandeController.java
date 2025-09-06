package com.example.aos_backend.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Service.DemandeService;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.dto.DemandeRequest;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.StatutDemande;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
@Tag(name = "Demande Controller", description = "Controller for managing demandes")
public class DemandeController {

    private final DemandeService demandeService;

    @PostMapping(value = "/nouveau_demande", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Demande> createDemande(
            @RequestPart DemandeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            Demande demande = demandeService.createDemande(request, files);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(demande);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DemandeDTO>> getDemandes() {
        try {
            List<DemandeDTO> demandes = demandeService.getDemandebyUserId();
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DemandeDTO> getDemandeById(@PathVariable Long id) {
        try {
            DemandeDTO demande = demandeService.getDemandeById(id);
            return ResponseEntity.ok(demande);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/service-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDemandeServiceData(@PathVariable Long id) {
        try {
            Map<String, Object> serviceData = demandeService.getDemandeServiceData(id);
            return ResponseEntity.ok(serviceData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{demandeId}/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long demandeId, @PathVariable Long documentId) {
        Demande demande = demandeService.getDemandById(demandeId);

        // First check in regular documents
        Optional<DocumentJustificatif> documentOpt = demande.getDocumentsJustificatifs().stream()
                .filter(doc -> doc.getId().equals(documentId))
                .findFirst();

        // If not found in regular documents, check response document
        if (!documentOpt.isPresent() && demande.getDocumentReponse() != null &&
                demande.getDocumentReponse().getId().equals(documentId)) {
            documentOpt = Optional.of(demande.getDocumentReponse());
        }

        DocumentJustificatif document = documentOpt.orElseThrow(() -> new RuntimeException("Document non trouvé"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment().filename(document.getFileName()).build());

        byte[] content = DocumentUtil.decompressDocument(document.getContent());

        return new ResponseEntity<>(content, HttpStatus.OK);
    }
}