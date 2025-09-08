package com.example.aos_backend.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
public class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private UserDetails userDetails;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        userDetails = User.withUsername("testuser")
                .password("password")
                .roles("USER")
                .build();

        // Set the secret key and expiration using ReflectionTestUtils
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "dGVzdGtleWZvcmp3dHRlc3R0ZXN0dGVzdHRlc3R0ZXN0dGVzdHRlc3R0ZXN0dGVzdA=="); // base64 encoded
                                                                                         // "testkeyforjwttesttesttesttesttesttesttesttesttest"
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
    }

    @Test
    public void testGenerateToken() {
        String token = jwtService.generateToken(userDetails);
        assertTrue(token != null && !token.isEmpty());
    }

    @Test
    public void testExtractUsername() {
        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    public void testIsTokenValid() {
        String token = jwtService.generateToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    public void testIsTokenInvalidForDifferentUser() {
        String token = jwtService.generateToken(userDetails);
        UserDetails differentUser = User.withUsername("otheruser")
                .password("password")
                .roles("USER")
                .build();
        assertFalse(jwtService.isTokenValid(token, differentUser));
    }
}
