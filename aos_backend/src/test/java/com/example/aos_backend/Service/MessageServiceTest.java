package com.example.aos_backend.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import com.example.aos_backend.Repository.MessageRepository;
import com.example.aos_backend.dto.ContactRequest;
import com.example.aos_backend.user.MessageContact;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MessageService messageService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSendMessage() {
        ContactRequest request = new ContactRequest();
        request.setNom("mary");
        request.setPrenom("ame");
        request.setEmail("exemple@example.com");
        request.setSujet("Test Subject");
        request.setTelephone("123567890");
        request.setMessage("This is a test message.");

        MessageContact savedMessage = MessageContact.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .sujet(request.getSujet())
                .telephone(request.getTelephone())
                .message(request.getMessage())
                .createdDate(LocalDateTime.now())
                .build();

        when(messageRepository.save(any(MessageContact.class))).thenReturn(savedMessage);

        MessageContact result = messageService.sendMessage(request);

        verify(messageRepository).save(any(MessageContact.class));
        assertEquals(request.getNom(), result.getNom());
        assertEquals(request.getPrenom(), result.getPrenom());
        assertEquals(request.getEmail(), result.getEmail());
        assertEquals(request.getSujet(), result.getSujet());
        assertEquals(request.getTelephone(), result.getTelephone());
        assertEquals(request.getMessage(), result.getMessage());
    }
}
