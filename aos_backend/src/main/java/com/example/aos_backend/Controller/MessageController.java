package com.example.aos_backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.MessageService;
import com.example.aos_backend.dto.ContactRequest;
import com.example.aos_backend.dto.ReclamationRequest;
import com.example.aos_backend.user.MessageContact;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@Tag(name = "Contact Controller", description = "Controller for managing contact")

public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<String> sendMessage(@RequestBody ContactRequest request) {
        try {

            MessageContact message = messageService.sendMessage(request);

            return ResponseEntity.status(HttpStatus.CREATED).body("Contact added successfully");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request: " + e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }

    }
}
