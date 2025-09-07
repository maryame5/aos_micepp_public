package com.example.aos_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class ContactRequest {

    private String nom;

    private String prenom;

    @NotEmpty(message = "Email is required")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    private String telephone;

    @NotEmpty(message = "sujet is required")
    @NotBlank(message = "sujet cannot be blank")

    private String sujet;

    @NotEmpty(message = "Message is required")
    @NotBlank(message = "Message cannot be blank")

    private String message;

}
