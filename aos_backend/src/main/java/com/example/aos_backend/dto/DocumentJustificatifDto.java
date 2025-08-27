package com.example.aos_backend.dto;

public class DocumentJustificatifDto {

    private Long id;
    private String fileName;
    private String contentType;
    private String uploadedAt;
    // No content field - files served via separate endpoint
}
