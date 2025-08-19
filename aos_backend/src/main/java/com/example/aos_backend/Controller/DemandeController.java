package com.example.aos_backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.DemandeService;
import com.example.aos_backend.Service.EmailService;
import com.example.aos_backend.user.Demande;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
@Tag(name = "Demande Controller", description = "Controller for managing demandes") 

public class DemandeController {

    private final DemandeService demandeService;
    private final EmailService emailService;

    public ResponseEntity<String> createDemande(@RequestBody DemandeRequest request) {
        try {
            demandeService.createDemande(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Demande created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating demande");
        }
        

    }

}
