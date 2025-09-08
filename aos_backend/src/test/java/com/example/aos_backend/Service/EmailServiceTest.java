package com.example.aos_backend.Service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.boot.test.context.SpringBootTest;
import org.thymeleaf.spring6.SpringTemplateEngine;

public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private SpringTemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSendEmail() throws MessagingException {
        String to = "test@example.com";
        String username = "testuser";
        EmailTemplateName templateName = EmailTemplateName.ACTIVATE_ACCOUNT;
        String confirmationUrl = "http://example.com/confirm";
        String activationCode = "123456";
        String subject = "Test Subject";

        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail(to, username, templateName, confirmationUrl, activationCode, subject);

        verify(mailSender).send(mimeMessage);
    }
}
