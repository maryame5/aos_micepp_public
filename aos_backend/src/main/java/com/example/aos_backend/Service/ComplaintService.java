package com.example.aos_backend.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.*;
import com.example.aos_backend.dto.ReclamationRequest;
import com.example.aos_backend.user.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ComplaintService {

        private final UtilisateurRepository userRepository;
        private final ComplaintRepository reclamationRepository;

        public void ajouterReclamation(ReclamationRequest request) {
                try {
                        // Récupérer l'utilisateur connecté
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication == null || authentication.getName() == null) {
                                throw new RuntimeException("No authenticated user found");
                        }

                        String userEmail = authentication.getName();
                        log.info("Creating complaint for user: {}", userEmail);

                        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Utilisateur non trouvé avec email: " + userEmail));

                        // Validate input
                        if (request.getObjet() == null || request.getObjet().trim().isEmpty()) {
                                throw new IllegalArgumentException("Objet cannot be null or empty");
                        }

                        if (request.getContenu() == null || request.getContenu().trim().isEmpty()) {
                                throw new IllegalArgumentException("Contenu cannot be null or empty");
                        }

                        Reclamation reclamation = Reclamation.builder()
                                        .objet(request.getObjet().trim())
                                        .contenu(request.getContenu().trim())
                                        .statut(StatutReclamation.EN_ATTENTE)
                                        .utilisateur(utilisateur)
                                        .dateSoumission(LocalDateTime.now())
                                        .lastModifiedDate(LocalDateTime.now())
                                        .build();

                        // Save the complaint
                        Reclamation savedReclamation = reclamationRepository.save(reclamation);
                        log.info("Complaint saved with ID: {}", savedReclamation.getId());

                } catch (Exception e) {
                        log.error("Error creating complaint: ", e);
                        throw e;
                }
        }

        @Transactional(readOnly = true)
        public List<Reclamation> getReclamationByUser() {
                try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication == null || authentication.getName() == null) {
                                throw new RuntimeException("No authenticated user found");
                        }

                        String userEmail = authentication.getName();
                        log.info("Fetching complaints for user: {}", userEmail);

                        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Utilisateur non trouvé avec email: " + userEmail));

                        List<Reclamation> reclamations = reclamationRepository.findByUtilisateur(utilisateur);
                        log.info("Found {} complaints for user {}", reclamations.size(), userEmail);

                        return reclamations;

                } catch (Exception e) {
                        log.error("Error fetching user complaints: ", e);
                        throw e;
                }
        }

        public Reclamation getReclamationById(Long id) {
                return reclamationRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));
        }

}