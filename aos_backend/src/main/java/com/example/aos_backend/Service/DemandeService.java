package com.example.aos_backend.Service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Controller.DemandeRequest;
import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.user.Demande;

import io.micrometer.core.ipc.http.HttpSender.Response;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DemandeService {
    // This class will handle the business logic related to "demande" (requests).
    // It will interact with the database and perform operations such as creating,
    // updating, and retrieving demandes.
    private final DemandeRepository demandeRepository;
    private final UtilisateurRepository userRepository;
    public void createDemande(DemandeRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createDemande'");
    }

    // Add methods to handle business logic here, such as:
    // - Creating a new demande
    // - Retrieving demandes by user ID, status, title, or description

  
}
