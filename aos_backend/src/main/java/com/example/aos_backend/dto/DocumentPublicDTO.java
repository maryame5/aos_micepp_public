package com.example.aos_backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocumentPublicDTO {
    private Long id;
    private String titre;
    private String description;
    private String contentType;
    private String fileName;
    private String type;
    private String publishedByName;
    private LocalDateTime createdDate;
}
