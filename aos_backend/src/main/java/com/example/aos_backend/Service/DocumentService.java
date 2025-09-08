package com.example.aos_backend.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.DocumentDTO;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final DemandeRepository demandeRepository;
    private final UtilisateurRepository userRepository;

    public List<DocumentDTO> getDocumentsByUserEmail(String userEmail) {
        Optional<Utilisateur> userOpt = userRepository.findByEmail(userEmail);
        if (!userOpt.isPresent()) {
            return new ArrayList<>();
        }

        return getDocumentsByUserId(userOpt.get().getId());
    }

    public List<DocumentDTO> getDocumentsByUserId(Integer userId) {
        Utilisateur user = userRepository.findById((userId)).orElse(null);
        List<Demande> userDemandes = demandeRepository.findByUtilisateur(user);
        List<DocumentDTO> allDocuments = new ArrayList<>();

        for (Demande demande : userDemandes) {
            // Ajouter les documents justificatifs
            if (demande.getDocumentsJustificatifs() != null) {
                for (DocumentJustificatif doc : demande.getDocumentsJustificatifs()) {
                    DocumentDTO documentDTO = convertToDocumentDTO(doc, demande);
                    documentDTO.setSource("Demande #" + demande.getId());
                    documentDTO.setSourceType("JUSTIFICATIF");
                    allDocuments.add(documentDTO);
                }
            }

            // Ajouter le document de réponse s'il existe
            if (demande.getDocumentReponse() != null) {
                DocumentDTO documentDTO = convertToDocumentDTO(demande.getDocumentReponse(), demande);
                documentDTO.setSource("Réponse à la demande #" + demande.getId());
                documentDTO.setSourceType("REPONSE");
                documentDTO.setCategory(determineResponseCategory(demande.getStatut()));
                allDocuments.add(documentDTO);
            }
        }

        // Trier par date de création décroissante
        allDocuments.sort((a, b) -> b.getUploadedAt().compareTo(a.getUploadedAt()));

        return allDocuments;
    }

    public DocumentJustificatif getDocumentById(Long documentId, String userEmail) {
        Optional<Utilisateur> userOpt = userRepository.findByEmail(userEmail);
        if (!userOpt.isPresent()) {
            return null;
        }

        Utilisateur user = userOpt.get();

        List<Demande> userDemandes = demandeRepository.findByUtilisateur(user);

        for (Demande demande : userDemandes) {
            // Rechercher dans les documents justificatifs
            if (demande.getDocumentsJustificatifs() != null) {
                for (DocumentJustificatif doc : demande.getDocumentsJustificatifs()) {
                    if (doc.getId().equals(documentId)) {
                        return doc;
                    }
                }
            }

            // Rechercher dans le document de réponse
            if (demande.getDocumentReponse() != null &&
                    demande.getDocumentReponse().getId().equals(documentId)) {
                return demande.getDocumentReponse();
            }
        }

        return null;
    }

    public List<String> getDocumentCategories() {
        return Arrays.asList(
                "Attestations",
                "Justificatifs",
                "Certificats",
                "Formulaires",
                "Réponses",
                "Autres");
    }

    public List<String> getDocumentTypes() {
        return Arrays.asList(
                "PDF",
                "DOC",
                "DOCX",
                "JPG",
                "JPEG",
                "PNG",
                "ZIP",
                "RAR");
    }

    private DocumentDTO convertToDocumentDTO(DocumentJustificatif document, Demande demande) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId().toString());
        dto.setName(document.getFileName());
        dto.setType(extractFileExtension(document.getFileName()));
        dto.setSize(document.getContent() != null ? document.getContent().length : 0);
        dto.setUploadedAt(document.getUploadedAt());
        dto.setDemandeId(demande.getId());
        dto.setDemandeReference("Demande #" + demande.getId());
        dto.setStatutDemande(demande.getStatut().name());

        // Déterminer la catégorie en fonction du type de document et de la demande
        dto.setCategory(determineDocumentCategory(document, demande));

        // Génération de l'URL de téléchargement
        dto.setDownloadUrl("/api/documents/" + document.getId() + "/download");
        dto.setPreviewUrl("/api/documents/" + document.getId() + "/preview");

        // Description basée sur le contexte
        dto.setDescription(generateDocumentDescription(document, demande));

        return dto;
    }

    private String extractFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "UNKNOWN";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toUpperCase();
    }

    private String determineDocumentCategory(DocumentJustificatif document, Demande demande) {
        String fileName = document.getFileName().toLowerCase();

        if (fileName.contains("attestation")) {
            return "Attestations";
        } else if (fileName.contains("certificat")) {
            return "Certificats";
        } else if (fileName.contains("justificatif") || fileName.contains("facture")) {
            return "Justificatifs";
        } else if (fileName.contains("formulaire")) {
            return "Formulaires";
        } else {
            // Déterminer par le type de service
            if (demande.getService() != null) {
                String serviceType = demande.getService().getType();
                switch (serviceType) {
                    case "TransportService":
                        return "Justificatifs";
                    case "SanteSocialeService":
                        return "Justificatifs";
                    case "LogementService":
                        return "Justificatifs";
                    case "AppuiScolaireService":
                        return "Certificats";
                    default:
                        return "Autres";
                }
            }
        }

        return "Autres";
    }

    private String determineResponseCategory(com.example.aos_backend.user.StatutDemande statut) {
        switch (statut) {
            case ACCEPTEE:
                return "Réponses";
            case REFUSEE:
                return "Réponses";
            default:
                return "Autres";
        }
    }

    private String generateDocumentDescription(DocumentJustificatif document, Demande demande) {
        StringBuilder description = new StringBuilder();

        if (demande.getService() != null && demande.getService().getServiceInfo() != null) {
            description.append("Document pour le service: ")
                    .append(demande.getService().getServiceInfo().getTitle());
        }

        description.append(" - Demande créée le ")
                .append(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")
                        .format(demande.getDateSoumission().atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()));

        return description.toString();
    }
}