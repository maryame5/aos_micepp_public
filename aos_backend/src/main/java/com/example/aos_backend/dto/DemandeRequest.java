package com.example.aos_backend.dto;

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
    private Map<String, Object> serviceData; // Données spécifiques au service
}
