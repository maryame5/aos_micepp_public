package com.example.aos_backend.Service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.user.Utilisateur;

@SpringBootTest
public class PasswordChangeServiceTest {

    @Mock
    private UtilisateurRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordChangeService passwordChangeService;

    private Utilisateur user;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        user = Utilisateur.builder()
                .email("test@example.com")
                .password("encodedOldPassword")
                .usingTemporaryPassword(true)
                .build();
    }

    @Test
    public void testChangePasswordSuccess() {
        String email = "test@example.com";
        String currentPassword = "oldPassword";
        String newPassword = "newPassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(currentPassword, user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");

        boolean result = passwordChangeService.changePassword(email, currentPassword, newPassword);

        assertTrue(result);
        verify(userRepository).save(any(Utilisateur.class));
    }

    @Test
    public void testChangePasswordFailureWrongCurrentPassword() {
        String email = "test@example.com";
        String currentPassword = "wrongPassword";
        String newPassword = "newPassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(currentPassword, user.getPassword())).thenReturn(false);

        boolean result = passwordChangeService.changePassword(email, currentPassword, newPassword);

        assertFalse(result);
    }

    @Test
    public void testChangePasswordFailureUserNotFound() {
        String email = "nonexistent@example.com";
        String currentPassword = "oldPassword";
        String newPassword = "newPassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        try {
            passwordChangeService.changePassword(email, currentPassword, newPassword);
        } catch (IllegalArgumentException e) {
            assertTrue(e.getMessage().contains("User not found"));
        }
    }
}
