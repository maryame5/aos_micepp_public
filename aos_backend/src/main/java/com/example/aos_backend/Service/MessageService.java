package com.example.aos_backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.MessageRepository;
import com.example.aos_backend.dto.ContactRequest;
import com.example.aos_backend.user.MessageContact;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageContact sendMessage(ContactRequest request) {

        MessageContact message = MessageContact.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .sujet(request.getSujet())
                .telephone(request.getTelephone())
                .message(request.getMessage())
                .createdDate(java.time.LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        return message;

    }

}
