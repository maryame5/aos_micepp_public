package com.example.aos_backend.Notification;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.user.Notification;
import com.example.aos_backend.user.NotificationType;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Notification> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        long count = notificationService.getUnreadNotificationCount(user);
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        notificationService.markAllNotificationsAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    // Endpoint to receive notifications from external systems (e.g.,
    // aos_micepp_back)
    @PostMapping("/external")
    public ResponseEntity<Void> receiveExternalNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            String type = (String) notificationData.get("type");
            Long demandeId = ((Number) notificationData.get("demandeId")).longValue();
            Integer userId = ((Number) notificationData.get("userId")).intValue();
            String message = (String) notificationData.get("message");
            String actionUrl = (String) notificationData.get("actionUrl");

            // Find the user
            Utilisateur user = utilisateurRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            String title;
            NotificationType notificationType;
            if ("demande_assigned".equals(type)) {
                title = "Demande assignée";
                notificationType = NotificationType.info;
            } else if ("demande_accepted".equals(type)) {
                title = "Demande acceptée";
                notificationType = NotificationType.success;
            } else if ("demande_refused".equals(type)) {
                title = "Demande refusée";
                notificationType = NotificationType.warning;
            } else if ("demande_treated".equals(type)) {
                title = "Demande traitée";
                notificationType = NotificationType.success;
            } else {
                return ResponseEntity.badRequest().build();
            }

            notificationService.createAndSendNotification(
                    user,
                    title,
                    message,
                    notificationType,
                    actionUrl != null ? actionUrl : "/agent/requests/" + demandeId);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
