package com.example.aos_backend.user;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "document_justificatif")
public class DocumentJustificatif {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "content")
    @JsonIgnore
    private byte[] content;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    @JsonBackReference
    private Demande demande;
}