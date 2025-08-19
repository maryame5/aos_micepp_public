package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.Demande;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
   

}
