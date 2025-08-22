package com.example.aos_backend.Controller;


import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.*;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DemandeRequest {

    private Long serviceId;
    private String commentaire;
    private List<String> documentsJustificatifs;
    private Map<String, Object> serviceData; // Données spécifiques au service
}
