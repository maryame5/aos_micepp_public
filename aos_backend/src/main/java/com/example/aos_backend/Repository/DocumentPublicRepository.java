package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.aos_backend.user.DocumentPublic;

public interface DocumentPublicRepository extends JpaRepository<DocumentPublic, Long> {
    List<DocumentPublic> findAllByOrderByCreatedDateDesc();

    List<DocumentPublic> findByTypeOrderByCreatedDateDesc(String type);

    @Query("SELECT d FROM DocumentPublic d WHERE UPPER(d.titre) LIKE UPPER(CONCAT('%', :query, '%')) OR UPPER(CAST(d.description AS STRING)) LIKE UPPER(CONCAT('%', :query2, '%')) ORDER BY d.createdDate DESC")
    List<DocumentPublic> findByTitreContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedDateDesc(
            @Param("query") String query, @Param("query2") String query2);

}
