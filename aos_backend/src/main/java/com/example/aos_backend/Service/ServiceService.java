// ServiceService.java - Version mise à jour avec la logique des champs dynamiques
package com.example.aos_backend.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.ServiceRepository;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.dto.FormField;
import com.example.aos_backend.user.ServiceEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceService {
    
    private final ServiceRepository serviceRepository;

    public List<ServiceDTO> getAllServices() {
        return serviceRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public ServiceDTO getServiceById(Long id) {
        Optional<ServiceEntity> service = serviceRepository.findById(id);
        return service.map(this::convertToDTO).orElse(null);
    }
    
    private ServiceDTO convertToDTO(ServiceEntity serviceEntity) {
        return ServiceDTO.builder()
            .id(serviceEntity.getId())
            .nom(serviceEntity.getNom())
            .type(serviceEntity.getType())
            .icon(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getIcon() : "business")
            .title(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getTitle() : serviceEntity.getNom())
            .description(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getDescription() : "")
            .features(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getFeatures() : Arrays.asList())
            .isActive(serviceEntity.getIsActive())
            .formFields(getFormFieldsForService(serviceEntity.getType()))
            .requiredDocuments(getRequiredDocumentsForService(serviceEntity.getType()))
            .build();
    }

    private List<FormField> getFormFieldsForService(String serviceType) {
        switch (serviceType) {
            case "TransportService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("trajet").type("text").label("Trajet")
                        .required(true).placeholder("Ex: Casa-Rabat").build(),
                    FormField.builder()
                        .id("2").name("pointDepart").type("text").label("Point de départ")
                        .required(true).build(),
                    FormField.builder()
                        .id("3").name("pointArrivee").type("text").label("Point d'arrivée")
                        .required(true).build(),
                    FormField.builder()
                        .id("4").name("frequence").type("select").label("Fréquence")
                        .required(true).options(Arrays.asList("Quotidien", "Hebdomadaire", "Mensuel", "Occasionnel")).build()
                );
            case "SanteSocialeService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("typeSoin").type("select").label("Type de soin")
                        .required(true).options(Arrays.asList("Consultation", "Chirurgie", "Médicaments", "Examens")).build(),
                    FormField.builder()
                        .id("2").name("montant").type("number").label("Montant (DH)")
                        .required(true).build()
                );
            case "LogementService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("typeLogement").type("select").label("Type de logement")
                        .required(true).options(Arrays.asList("Appartement", "Maison", "Studio")).build(),
                    FormField.builder()
                        .id("2").name("localisationSouhaitee").type("text").label("Localisation souhaitée")
                        .required(true).build(),
                    FormField.builder()
                        .id("3").name("montantParticipation").type("number").label("Montant de participation (DH)")
                        .required(true).build()
                );
            case "ColonieVacanceService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("nombreEnfants").type("number").label("Nombre d'enfants")
                        .required(true).build(),
                    FormField.builder()
                        .id("2").name("lieuSouhaite").type("text").label("Lieu souhaité")
                        .required(true).build(),
                    FormField.builder()
                        .id("3").name("periode").type("text").label("Période")
                        .required(true).placeholder("Ex: Juillet 2024").build()
                );
            case "AppuiScolaireService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("niveau").type("select").label("Niveau scolaire")
                        .required(true).options(Arrays.asList("Primaire", "Collège", "Lycée", "Supérieur")).build(),
                    FormField.builder()
                        .id("2").name("typeAide").type("select").label("Type d'aide")
                        .required(true).options(Arrays.asList("Cours particuliers", "Fournitures", "Frais de scolarité")).build(),
                    FormField.builder()
                        .id("3").name("montantDemande").type("number").label("Montant demandé (DH)")
                        .required(true).build()
                );
            case "ActiviteCulturelleSportiveService":
                return Arrays.asList(
                    FormField.builder()
                        .id("1").name("typeActivite").type("select").label("Type d'activité")
                        .required(true).options(Arrays.asList("Sport", "Culture", "Loisir")).build(),
                    FormField.builder()
                        .id("2").name("nomActivite").type("text").label("Nom de l'activité")
                        .required(true).build(),
                    FormField.builder()
                        .id("3").name("dateActivite").type("date").label("Date de l'activité")
                        .required(true).build()
                );
            default:
                return Arrays.asList();
        }
    }

    private List<String> getRequiredDocumentsForService(String serviceType) {
        switch (serviceType) {
            case "TransportService":
                return Arrays.asList("Justificatif de domicile", "Attestation de travail");
            case "SanteSocialeService":
                return Arrays.asList("Ordonnance médicale", "Facture originale", "Attestation de mutuelle");
            case "LogementService":
                return Arrays.asList("Justificatif de revenus", "Attestation de domicile", "Contrat de location");
            case "ColonieVacanceService":
                return Arrays.asList("Certificat de scolarité", "Justificatif de revenus");
            case "AppuiScolaireService":
                return Arrays.asList("Certificat de scolarité", "Justificatif de revenus", "Bulletins scolaires");
            case "ActiviteCulturelleSportiveService":
                return Arrays.asList("Certificat médical", "Justificatif de revenus");
            default:
                return Arrays.asList("Pièce d'identité", "Justificatif de revenus");
        }
    }
}