package com.example.aos_backend.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.aos_backend.Service.ComplaintService;
import com.example.aos_backend.dto.ReclamationRequest;
import com.example.aos_backend.user.Reclamation;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/Reclamation")
@CrossOrigin(origins = "*") // Add CORS support
@RequiredArgsConstructor
@Tag(name = "Reclamation", description = "Operations related to complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/ajouter")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> ajouterReclamation(@RequestBody ReclamationRequest request) {
        try {
            // Add validation
            if (request.getObjet() == null || request.getObjet().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Objet is required");
            }

            if (request.getContenu() == null || request.getContenu().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contenu is required");
            }

            if (request.getObjet().length() < 5 || request.getObjet().length() > 200) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Objet must be between 5 and 200 characters");
            }

            if (request.getContenu().length() < 20 || request.getContenu().length() > 2000) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Contenu must be between 20 and 2000 characters");
            }

            complaintService.ajouterReclamation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Reclamation added successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request: " + e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found or unauthorized");

        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Reclamation>> getAllReclamations() {
        try {
            List<Reclamation> reclamations = complaintService.getReclamationByUser();
            return ResponseEntity.ok(reclamations);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id) {
        try {
            Reclamation reclamation = complaintService.getReclamationById(id);
            return ResponseEntity.ok(reclamation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}