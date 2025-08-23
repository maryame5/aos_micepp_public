package com.example.aos_backend.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Controller.DemandeRequest;
import com.example.aos_backend.Service.DemandeService;
import com.example.aos_backend.Service.EmailService;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.StatutDemande;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
@Tag(name = "Demande Controller", description = "Controller for managing demandes")

public class DemandeController {

    private final DemandeService demandeService;

    @PostMapping("/nouveau_demande")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> createDemande(@RequestBody DemandeRequest request) {
        try {
            demandeService.createDemande(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Demande created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating demande");
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Demande>> getDemandes() {
        try {
            List<Demande> demandes = demandeService.getDemandebyUserId();
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Demande>> getAllDemandes() {
        try {
            List<Demande> demandes = demandeService.getAllDemandes();
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Demande> getDemandeById(@PathVariable Long id) {
        try {
            Optional<Demande> demande = demandeService.getDemandeById(id);
            if (demande.isPresent()) {
                return ResponseEntity.ok(demande.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateDemandeStatus(
            @PathVariable Long id,
            @RequestBody StatutDemande newStatus) {
        try {
            demandeService.updateDemandeStatus(id, newStatus);
            return ResponseEntity.ok("Status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating status");
        }
    }

    @PutMapping("/{id}/document-reponse")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addDocumentReponse(
            @PathVariable Long id,
            @RequestBody String documentPath) {
        try {
            demandeService.addDocumentReponse(id, documentPath);
            return ResponseEntity.ok("Document response added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding document response");
        }
    }
}
