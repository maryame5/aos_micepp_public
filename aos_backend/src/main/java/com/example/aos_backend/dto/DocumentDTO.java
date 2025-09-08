
package com.example.aos_backend.dto;

import java.time.LocalDateTime;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentDTO {
    private String id;
    private String name;
    private String type;
    private String category;
    private long size;
    private String downloadUrl;
    private String previewUrl;
    private LocalDateTime uploadedAt;
    private String description;

    // Informations sur la demande associée
    private Integer demandeId;
    private String demandeReference;
    private String statutDemande;

    // Source du document
    private String source;
    private String sourceType; // "JUSTIFICATIF" ou "REPONSE"
}