package com.example.aos_backend.user;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "demande")
public class Demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "date_soumission", updatable = false)
    private LocalDateTime dateSoumission;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut;

    private String commentaire;

    @ElementCollection
    @CollectionTable(name = "demande_documents", joinColumns = @JoinColumn(name = "demande_id"))
    @Column(name = "document_path")
    private List<String> documentsJustificatifs;

    @Column(name = "document_reponse")
    private String documentReponse;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @LastModifiedDate
    @Column(name = "updated_date", insertable = false)
    private LocalDateTime lastModifiedDate;
}