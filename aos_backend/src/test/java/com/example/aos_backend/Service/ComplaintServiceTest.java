package com.example.aos_backend.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.aos_backend.Repository.ComplaintRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.ReclamationRequest;
import com.example.aos_backend.user.Reclamation;
import com.example.aos_backend.user.StatutReclamation;
import com.example.aos_backend.user.Utilisateur;

public class ComplaintServiceTest {

    @Mock
    private UtilisateurRepository userRepository;

    @Mock
    private ComplaintRepository reclamationRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ComplaintService complaintService;

    private Utilisateur utilisateur;
    private ReclamationRequest request;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        utilisateur = Utilisateur.builder()
                .id(1)
                .email("test@example.com")
                .build();

        request = new ReclamationRequest();
        request.setObjet("Test Object");
        request.setContenu("Test Content");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    public void testAjouterReclamation_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        when(reclamationRepository.save(any(Reclamation.class))).thenAnswer(invocation -> {
            Reclamation rec = invocation.getArgument(0);
            rec.setId(1L);
            return rec;
        });

        assertDoesNotThrow(() -> complaintService.ajouterReclamation(request));

        verify(userRepository).findByEmail("test@example.com");
        verify(reclamationRepository).save(any(Reclamation.class));
    }

    @Test
    public void testAjouterReclamation_UserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> complaintService.ajouterReclamation(request));
        assertEquals("Utilisateur non trouvé avec email: test@example.com", exception.getMessage());
    }

    @Test
    public void testAjouterReclamation_InvalidObjet() {
        request.setObjet("");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> complaintService.ajouterReclamation(request));
        assertEquals("Objet cannot be null or empty", exception.getMessage());
    }

    @Test
    public void testAjouterReclamation_InvalidContenu() {
        request.setContenu(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> complaintService.ajouterReclamation(request));
        assertEquals("Contenu cannot be null or empty", exception.getMessage());
    }

    @Test
    public void testGetReclamationByUser_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));
        List<Reclamation> reclamations = Arrays.asList(new Reclamation(), new Reclamation());
        when(reclamationRepository.findByUtilisateur(utilisateur)).thenReturn(reclamations);

        List<Reclamation> result = complaintService.getReclamationByUser();

        assertEquals(2, result.size());
        verify(userRepository).findByEmail("test@example.com");
        verify(reclamationRepository).findByUtilisateur(utilisateur);
    }

    @Test
    public void testGetReclamationByUser_UserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> complaintService.getReclamationByUser());
        assertEquals("Utilisateur non trouvé avec email: test@example.com", exception.getMessage());
    }

    @Test
    public void testGetReclamationById_Success() {
        Reclamation reclamation = new Reclamation();
        reclamation.setId(1L);
        when(reclamationRepository.findById(1L)).thenReturn(Optional.of(reclamation));

        Reclamation result = complaintService.getReclamationById(1L);

        assertEquals(1L, result.getId());
        verify(reclamationRepository).findById(1L);
    }

    @Test
    public void testGetReclamationById_NotFound() {
        when(reclamationRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> complaintService.getReclamationById(1L));
        assertEquals("Reclamation not found with id: 1", exception.getMessage());
    }
}
