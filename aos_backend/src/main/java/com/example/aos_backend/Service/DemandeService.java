package com.example.aos_backend.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.Repository.ServiceRepository;
import com.example.aos_backend.Repository.StorageRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.dto.DemandeRequest;
import com.example.aos_backend.dto.DocumentJustificatifDto;
import com.example.aos_backend.user.*;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeService {

    @Autowired
    private final DemandeRepository demandeRepository;
    @Autowired
    private final UtilisateurRepository userRepository;
    @Autowired
    private final ServiceRepository serviceRepository;
    @Autowired
    private final StorageRepository storageRepository;

    @Transactional
    public Demande createDemande(DemandeRequest request, List<MultipartFile> files) throws java.io.IOException {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userEmail));

        // Récupérer le service
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service non trouvé: " + request.getServiceId()));

        // Créer la demande SANS les documents d'abord
        Demande demande = Demande.builder()
                .statut(StatutDemande.EN_ATTENTE)
                .description(request.getDescription())
                .documentsJustificatifs(new ArrayList<>()) // Liste vide pour commencer
                .utilisateur(utilisateur)
                .service(service)
                .lastModifiedDate(LocalDateTime.now())
                .build();

        // Sauvegarder la demande pour obtenir l'ID
        demande = demandeRepository.save(demande);

        // Maintenant traiter les fichiers uploadés
        if (files != null && !files.isEmpty()) {
            List<DocumentJustificatif> documents = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        byte[] fileContent = file.getBytes();

                        DocumentJustificatif doc = DocumentJustificatif.builder()
                                .fileName(file.getOriginalFilename())
                                .contentType(file.getContentType())
                                .content(DocumentUtil.compressDocument(file.getBytes()))
                                .type("justificatif")
                                .uploadedAt(LocalDateTime.now())
                                .demande(demande)
                                .build();

                        storageRepository.save(doc);
                        documents.add(doc);
                    } catch (IOException e) {
                        throw new RuntimeException("Erreur lors de la lecture du fichier: " + e.getMessage());
                    }
                }
            }

            // Ajouter tous les documents à la demande
            demande.getDocumentsJustificatifs().addAll(documents);

            // Sauvegarder à nouveau pour persister les documents
            demande = demandeRepository.save(demande);
        }

        // Traiter les données spécifiques au service
        if (request.getServiceData() != null && !request.getServiceData().isEmpty()) {
            processServiceData(service, request.getServiceData(), demande);
        }

        return demande;
    }

    @Transactional
    public List<DemandeDTO> getDemandebyUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Demande> demandes = demandeRepository.findByUtilisateur(utilisateur);

        try {
            return demandes.stream().map(d -> DemandeDTO.builder()
                    .id(d.getId())
                    .description(d.getDescription())
                    .statut(d.getStatut().name())
                    .dateSoumission(d.getDateSoumission())
                    .commentaire(d.getCommentaire())
                    .utilisateurId(d.getUtilisateur().getId())
                    .utilisateurNom(d.getUtilisateur().fullname())
                    .utilisateurEmail(d.getUtilisateur().getEmail())
                    .commentaire(d.getCommentaire())
                    .serviceId(d.getService().getId())
                    .serviceNom(d.getService().getNom())
                    .documentsJustificatifs(d.getDocumentsJustificatifs() != null
                            ? d.getDocumentsJustificatifs().stream()
                                    .map(doc -> DocumentJustificatifDto.builder()
                                            .id(doc.getId())
                                            .fileName(doc.getFileName())
                                            .contentType(doc.getContentType())
                                            .type(doc.getType())
                                            .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                            .build())
                                    .toList()
                            : List.of())
                    .documentReponse(d.getDocumentReponse() != null
                            ? DocumentJustificatifDto.builder()
                                    .id(d.getDocumentReponse().getId())
                                    .fileName(d.getDocumentReponse().getFileName())
                                    .contentType(d.getDocumentReponse().getContentType())
                                    .type(d.getDocumentReponse().getType())
                                    .uploadedAt(d.getDocumentReponse().getUploadedAt() != null
                                            ? d.getDocumentReponse().getUploadedAt()
                                            : null)
                                    .build()
                            : null)
                    .build()).toList();

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Demande getDemandById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée pour l'ID: " + id));
    }

    @Transactional
    public DemandeDTO getDemandeById(Long id) {
        Optional<Demande> demandeOpt = demandeRepository.findById(id);
        if (demandeOpt.isEmpty()) {
            throw new RuntimeException("Demande not found for ID: " + id);
        }
        Demande d = demandeOpt.get();
        return DemandeDTO.builder()
                .id(d.getId())
                .description(d.getDescription())
                .statut(d.getStatut().name())
                .commentaire((d.getCommentaire() != null) ? d.getCommentaire() : "")
                .dateSoumission(d.getDateSoumission())
                .utilisateurId(d.getUtilisateur().getId())
                .utilisateurNom(d.getUtilisateur().fullname())
                .utilisateurEmail(d.getUtilisateur().getEmail())
                .commentaire(d.getCommentaire())
                .serviceId(d.getService().getId())
                .serviceNom(d.getService().getNom())
                .documentsJustificatifs(d.getDocumentsJustificatifs() != null
                        ? d.getDocumentsJustificatifs().stream()
                                .map(doc -> DocumentJustificatifDto.builder()
                                        .id(doc.getId())
                                        .fileName(doc.getFileName())
                                        .contentType(doc.getContentType())
                                        .type(doc.getType())
                                        .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                        .build())
                                .toList()
                        : List.of())
                .documentReponse(d.getDocumentReponse() != null
                        ? DocumentJustificatifDto.builder()
                                .id(d.getDocumentReponse().getId())
                                .fileName(d.getDocumentReponse().getFileName())
                                .contentType(d.getDocumentReponse().getContentType())
                                .type(d.getDocumentReponse().getType())
                                .uploadedAt(d.getDocumentReponse().getUploadedAt() != null
                                        ? d.getDocumentReponse().getUploadedAt()
                                        : null)
                                .build()
                        : null)
                .build();
    }

    @Transactional
    public Map<String, Object> getDemandeServiceData(Long demandeId) {
        Optional<Demande> demandeOpt = demandeRepository.findById(demandeId);

        Demande demande = demandeOpt.get();
        ServiceEntity service = demande.getService();

        return extractServiceSpecificData(service);
    }

    private void processServiceData(ServiceEntity service, Map<String, Object> serviceData, Demande demande) {
        String serviceType = service.getType();
        log.info("Processing service data for type: {}", serviceType);

        switch (serviceType) {
            case "TransportService":
                processTransportServiceData((TransportService) service, serviceData);
                break;
            case "SanteSocialeService":
                processSanteSocialeServiceData((SanteSocialeService) service, serviceData);
                break;
            case "LogementService":
                processLogementServiceData((LogementService) service, serviceData);
                break;
            case "ColonieVacanceService":
                processColonieVacanceServiceData((ColonieVacanceService) service, serviceData);
                break;
            case "AppuiScolaireService":
                processAppuiScolaireServiceData((AppuiScolaireService) service, serviceData);
                break;
            case "ActiviteCulturelleSportiveService":
                processActiviteCulturelleSportiveServiceData((ActiviteCulturelleSportiveService) service, serviceData);
                break;
            default:
                log.warn("Unsupported service type: {}", serviceType);
        }

        // Sauvegarder les modifications du service
        serviceRepository.save(service);
    }

    private Map<String, Object> extractServiceSpecificData(ServiceEntity service) {
        Map<String, Object> data = new HashMap<>();
        String serviceType = service.getType();

        switch (serviceType) {
            case "TransportService":
                TransportService transportService = (TransportService) service;
                data.put("trajet", transportService.getTrajet());
                data.put("pointDepart", transportService.getPointDepart());
                data.put("pointArrivee", transportService.getPointArrivee());
                data.put("frequence", transportService.getFrequence());
                break;

            case "SanteSocialeService":
                SanteSocialeService santeService = (SanteSocialeService) service;
                data.put("typeSoin", santeService.getTypeSoin());
                data.put("montant", santeService.getMontant());
                break;

            case "LogementService":
                LogementService logementService = (LogementService) service;
                data.put("typeLogement", logementService.getTypeLogement());
                data.put("localisationSouhaitee", logementService.getLocalisationSouhaitee());
                data.put("montantParticipation", logementService.getMontantParticipation());
                break;

            case "ColonieVacanceService":
                ColonieVacanceService colonieService = (ColonieVacanceService) service;
                data.put("nombreEnfants", colonieService.getNombreEnfants());
                data.put("lieuSouhaite", colonieService.getLieuSouhaite());
                data.put("periode", colonieService.getPeriode());
                break;

            case "AppuiScolaireService":
                AppuiScolaireService appuiService = (AppuiScolaireService) service;
                data.put("niveau", appuiService.getNiveau());
                data.put("typeAide", appuiService.getTypeAide());
                data.put("montantDemande", appuiService.getMontantDemande());
                break;

            case "ActiviteCulturelleSportiveService":
                ActiviteCulturelleSportiveService activiteService = (ActiviteCulturelleSportiveService) service;
                data.put("typeActivite", activiteService.getTypeActivite());
                data.put("nomActivite", activiteService.getNomActivite());
                data.put("dateActivite", activiteService.getDateActivite());
                break;
        }

        return data;
    }

    // Service-specific data processing methods
    private void processTransportServiceData(TransportService service, Map<String, Object> data) {
        if (data.containsKey("trajet")) {
            service.setTrajet((String) data.get("trajet"));
        }
        if (data.containsKey("pointDepart")) {
            service.setPointDepart((String) data.get("pointDepart"));
        }
        if (data.containsKey("pointArrivee")) {
            service.setPointArrivee((String) data.get("pointArrivee"));
        }
        if (data.containsKey("frequence")) {
            service.setFrequence((String) data.get("frequence"));
        }
    }

    private void processSanteSocialeServiceData(SanteSocialeService service, Map<String, Object> data) {
        if (data.containsKey("typeSoin")) {
            service.setTypeSoin((String) data.get("typeSoin"));
        }
        if (data.containsKey("montant")) {
            service.setMontant(Double.valueOf(data.get("montant").toString()));
        }
    }

    private void processLogementServiceData(LogementService service, Map<String, Object> data) {
        if (data.containsKey("typeLogement")) {
            service.setTypeLogement((String) data.get("typeLogement"));
        }
        if (data.containsKey("localisationSouhaitee")) {
            service.setLocalisationSouhaitee((String) data.get("localisationSouhaitee"));
        }
        if (data.containsKey("montantParticipation")) {
            service.setMontantParticipation(Double.valueOf(data.get("montantParticipation").toString()));
        }
    }

    private void processColonieVacanceServiceData(ColonieVacanceService service, Map<String, Object> data) {
        if (data.containsKey("nombreEnfants")) {
            service.setNombreEnfants(Integer.valueOf(data.get("nombreEnfants").toString()));
        }
        if (data.containsKey("lieuSouhaite")) {
            service.setLieuSouhaite((String) data.get("lieuSouhaite"));
        }
        if (data.containsKey("periode")) {
            service.setPeriode((String) data.get("periode"));
        }
    }

    private void processAppuiScolaireServiceData(AppuiScolaireService service, Map<String, Object> data) {
        if (data.containsKey("niveau")) {
            service.setNiveau((String) data.get("niveau"));
        }
        if (data.containsKey("typeAide")) {
            service.setTypeAide((String) data.get("typeAide"));
        }
        if (data.containsKey("montantDemande")) {
            service.setMontantDemande(Double.valueOf(data.get("montantDemande").toString()));
        }
    }

    private void processActiviteCulturelleSportiveServiceData(ActiviteCulturelleSportiveService service,
            Map<String, Object> data) {
        if (data.containsKey("typeActivite")) {
            service.setTypeActivite((String) data.get("typeActivite"));
        }
        if (data.containsKey("nomActivite")) {
            service.setNomActivite((String) data.get("nomActivite"));
        }
        if (data.containsKey("dateActivite")) {
            service.setDateActivite((String) data.get("dateActivite"));
        }
    }
}