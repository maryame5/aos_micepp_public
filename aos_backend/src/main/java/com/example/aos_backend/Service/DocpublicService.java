package com.example.aos_backend.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Repository.DocumentPublicRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.DocumentPublicDTO;
import com.example.aos_backend.user.DocumentPublic;
import com.example.aos_backend.user.Utilisateur;
import com.example.aos_backend.Util.DocumentUtil;

@Service
@Transactional
public class DocpublicService {

    @Autowired
    private DocumentPublicRepository documentRepository;

    /**
     * Récupère tous les documents publics
     */
    @Transactional(readOnly = true)
    public List<DocumentPublicDTO> getAllPublicDocuments() {
        List<DocumentPublic> documents = documentRepository.findAllByOrderByCreatedDateDesc();
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un document public par son ID
     */
    @Transactional(readOnly = true)
    public DocumentPublicDTO getPublicDocumentById(Long id) {
        Optional<DocumentPublic> document = documentRepository.findById(id);
        return document.map(this::convertToDTO).orElse(null);
    }

    /**
     * Récupère un document par son ID (avec contenu complet)
     */
    @Transactional(readOnly = true)
    public DocumentPublic getDocumentById(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DocumentPublicDTO> getDocumentsByType(String type) {
        List<DocumentPublic> documents = documentRepository.findByTypeOrderByCreatedDateDesc(type);
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Recherche dans les documents
     */
    @Transactional(readOnly = true)
    public List<DocumentPublicDTO> searchDocuments(String query) {
        List<DocumentPublic> documents = documentRepository
                .findByTitreContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedDateDesc(
                        query, query);
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private DocumentPublicDTO convertToDTO(DocumentPublic document) {
        String publishedByName = document.getPublishedBy() != null
                ? document.getPublishedBy().getFirstname() + " " + document.getPublishedBy().getLastname()
                : "Système";

        return DocumentPublicDTO.builder()
                .id(document.getId())
                .titre(document.getTitre())
                .description(document.getDescription() != null
                        ? document.getDescription().substring(0, Math.min(document.getDescription().length(), 255))
                        : null)
                .contentType(document.getContentType())
                .fileName(document.getFileName())
                .type(document.getType())
                .publishedByName(publishedByName)
                .createdDate(document.getCreatedDate())
                .build();
    }

}