package com.example.aos_backend.Notification;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.NotificationRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Notification;
import com.example.aos_backend.user.NotificationType;
import com.example.aos_backend.user.Utilisateur;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
    @Autowired
    private SimpMessagingTemplate template;

    private final NotificationRepository notificationRepository;
    private final AdminRepository adminRepository;
    private final UtilisateurRepository userRepository;

    public void sendNotification(String message) {
        template.convertAndSend("/topic/notifications", message);
    }

    public Notification createAndSendNotification(Utilisateur user, String title, String message, NotificationType type,
            String actionUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .actionUrl(actionUrl)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send via WebSocket
        template.convertAndSend("/topic/notifications/" + user.getId(), saved);

        return saved;
    }

    public List<Notification> getUserNotifications(Utilisateur user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadNotificationCount(Utilisateur user) {
        return notificationRepository.countUnreadByUser(user);
    }

    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllNotificationsAsRead(Utilisateur user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void notifyAdminNewDemande(com.example.aos_backend.user.Demande demande) {
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            Utilisateur user = admin.getUtilisateur();

            Notification notification = Notification.builder()
                    .user(user)
                    .title("Nouvelle demande créée")
                    .message("Une nouvelle demande a été créée: " + demande.getDescription())
                    .type(NotificationType.info)
                    .isRead(false)
                    .actionUrl("/agent/requests/" + demande.getId())
                    .build();

            notificationRepository.save(notification);

            // Send via WebSocket
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }

    public void notifyAssignDemande(DemandeDTO demande) {
        Utilisateur user = userRepository.findById(demande.getUtilisateurId())
                .orElseThrow();
        createAndSendNotification(user, "Demande assignée",
                "Votre demande a été assignée pour traitement: " + demande.getDescription(), NotificationType.info,
                "/agent/requests/" + demande.getId());
    }

    public void notifyUpdateDemande(DemandeDTO demande) {

        Utilisateur user = userRepository.findById(demande.getUtilisateurId())
                .orElseThrow();
        createAndSendNotification(user, "demande mis a jour",
                "Une demande a été mise a jour: " + demande.getDescription(), NotificationType.info,
                "/agent/requests/" + demande.getId());

    }

    public void notifyFinishDemande(DemandeDTO demande, String status) {
        Utilisateur user = userRepository.findById(demande.getUtilisateurId())
                .orElseThrow();
        String title = status.equals("ACCEPTED") ? "Demande acceptée" : "Demande refusée";
        String message = status.equals("ACCEPTED") ? "Votre demande a été acceptée: " + demande.getDescription()
                : "Votre demande a été refusée: " + demande.getDescription();
        NotificationType type = status.equals("ACCEPTED") ? NotificationType.success : NotificationType.warning;
        createAndSendNotification(user, title, message, type, "/agent/requests/" + demande.getId());
    }

}
