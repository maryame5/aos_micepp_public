package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.Utilisateur;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {
        List<Demande> findByUtilisateur(Utilisateur utilisateur);

}
