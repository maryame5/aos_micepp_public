package com.example.aos_backend.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Controller.DemandeRequest;
import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.Repository.ServiceRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.user.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final UtilisateurRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public void createDemande(DemandeRequest request) {
        // Récupérer l'utilisateur connecté
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Récupérer le service
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        // Créer la demande
        Demande demande = Demande.builder()
                .statut(StatutDemande.EN_ATTENTE)
                .commentaire(request.getCommentaire())
                .documentsJustificatifs(request.getDocumentsJustificatifs())
                .utilisateur(utilisateur)
                .service(service)
                .build();

        // Sauvegarder la demande
        demandeRepository.save(demande);

        // Traiter les données spécifiques au service
        if (request.getServiceData() != null && !request.getServiceData().isEmpty()) {
            processServiceData(service, request.getServiceData(), demande);
        }
    }

    public List<Demande> getDemandebyUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Utilisateur utilisateur = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return demandeRepository.findByUtilisateur(utilisateur);
    }

    public List<Demande> getAllDemandes() {
        return demandeRepository.findAll();
    }

    public Optional<Demande> getDemandeById(Long id) {
        return demandeRepository.findById(id);
    }

    @Transactional
    public void updateDemandeStatus(Long demandeId, StatutDemande newStatus) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatut(newStatus);
        demandeRepository.save(demande);
    }

    @Transactional
    public void addDocumentReponse(Long demandeId, String documentPath) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setDocumentReponse(documentPath);
        demandeRepository.save(demande);
    }

    private void processServiceData(ServiceEntity service, Map<String, Object> serviceData, Demande demande) {
        String serviceType = service.getType();

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
                System.out.println("Type de service non supporté: " + serviceType);
        }

        // Sauvegarder les modifications du service
        serviceRepository.save(service);
    }

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