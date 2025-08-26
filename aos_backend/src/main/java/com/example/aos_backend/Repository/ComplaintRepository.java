package com.example.aos_backend.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Reclamation;
import com.example.aos_backend.user.StatutReclamation;
import com.example.aos_backend.user.Utilisateur;

@Repository
public interface ComplaintRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findByUtilisateur(Utilisateur utilisateur);

    /**
     * Find complaints by user ordered by submission date (newest first)
     */
    List<Reclamation> findByUtilisateurOrderByDateSoumissionDesc(Utilisateur utilisateur);

    /**
     * Find complaints by status
     */
    List<Reclamation> findByStatut(StatutReclamation statut);

    /**
     * Find complaints by user and status
     */
    List<Reclamation> findByUtilisateurAndStatut(Utilisateur utilisateur, StatutReclamation statut);

    /**
     * Count complaints by user
     */
    long countByUtilisateur(Utilisateur utilisateur);

    /**
     * Count complaints by status
     */
    long countByStatut(StatutReclamation statut);

    /**
     * Find complaints containing keyword in objet or contenu
     */
    @Query("SELECT r FROM Reclamation r WHERE " +
            "(LOWER(r.objet) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.contenu) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Reclamation> findByKeyword(@Param("keyword") String keyword);

    /**
     * Find complaints by user containing keyword
     */
    @Query("SELECT r FROM Reclamation r WHERE r.utilisateur = :utilisateur AND " +
            "(LOWER(r.objet) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.contenu) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Reclamation> findByUtilisateurAndKeyword(@Param("utilisateur") Utilisateur utilisateur,
            @Param("keyword") String keyword);

    /**
     * Find all complaints ordered by submission date (newest first)
     */
    List<Reclamation> findAllByOrderByDateSoumissionDesc();

    /**
     * Find complaints by user, status and keyword
     */
    @Query("SELECT r FROM Reclamation r WHERE r.utilisateur = :utilisateur " +
            "AND (:statut IS NULL OR r.statut = :statut) " +
            "AND (:keyword IS NULL OR " +
            "LOWER(r.objet) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.contenu) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Reclamation> findByUtilisateurAndFilters(@Param("utilisateur") Utilisateur utilisateur,
            @Param("statut") StatutReclamation statut,
            @Param("keyword") String keyword);
}