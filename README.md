# AOS MICEPP - Portail Public et Espace Utilisateur

## Aperçu Général

L'Association Sociale du Ministère de l'Investissement, de la Convergence et de l'Évaluation des Politiques Publiques (AOS MICEPP) est dédiée à l'amélioration du bien-être des agents du ministère et de leurs familles. Ce portail web intègre une interface publique informative et un espace sécurisé pour les agents, permettant la gestion des demandes de services sociaux, des réclamations, des documents et des notifications.

Le système est conçu pour être intuitif, sécurisé et responsive, avec une architecture moderne basée sur des technologies full-stack. Il facilite l'accès aux services sociaux, la communication et le suivi des demandes en temps réel.

## Fonctionnalités Principales

### 1. Interface Publique
L'interface publique est accessible à tous et vise à informer sur les activités et services de l'AOS MICEPP.

- **Page d'Accueil** : 
  - Présentation hero avec mission de l'association.
  - Aperçu des services sociaux (colonies de vacances, assistance médicale, activités sportives, appui scolaire, transport des agents, aide au logement).
  - Section actualités récentes avec les 3 dernières publications (actualités, articles, documents, annonces).

- **Services** :
  - Catalogue détaillé des services offerts, avec descriptions, icônes et fonctionnalités clés.
  - Boutons d'action pour accéder à l'espace agent ou en savoir plus.
  - Dialogue modal pour détails supplémentaires sur chaque service.

- **Actualités et Documents** :
  - Liste filtrable et triable des publications (par type : actualités, articles, documents, annonces ; par date ou titre).
  - Recherche par titre, contenu ou auteur.
  - Affichage avec aperçu, métadonnées (date, auteur, type) et actions (lire la suite, partager, télécharger).
  - Support des images et icônes pour les types de fichiers.
  - Page de détail pour chaque publication avec contenu complet et téléchargement.

- **Contact** :
  - Formulaire de contact sécurisé (nom, prénom, email, téléphone, sujet, message).
  - Sujets prédéfinis : demande d'information, support technique, réclamation, suggestion, autre.
  - Informations de contact (adresse, téléphone, email, horaires).
  - Section FAQ avec questions courantes sur l'inscription, délais de traitement et support.

- **Gestion des Erreurs** :
  - Pages 404 et accès non autorisé.
  - États vides et d'erreur avec messages clairs et actions de retry.

### 2. Espace Utilisateur (Sécurisé)
L'espace utilisateur nécessite une authentification (login/mot de passe) et est protégé par des guards de rôle (Agent, Admin, Support). Quel que soit le rôle de l'utilisateur, il peut soumettre des demandes de services sociaux ou des réclamations. Le traitement de ces demandes et réclamations est effectué dans l'application d'administration (aos_micepp_back).

- **Authentification** :
  - Connexion sécurisée avec JWT.
  - Changement de mot de passe.
  - Guards pour routes publiques/privées et rôles.

- **Tableau de Bord** :
  - Accueil personnalisé avec message de bienvenue.
  - Statistiques : demandes en attente, en cours, terminées, total.
  - Liste des demandes récentes avec statut et actions (voir détails).
  - Actions rapides : nouvelle demande, mes demandes, réclamations, documents, profil, services.

- **Gestion des Demandes** :
  - Création de nouvelle demande via wizard en 4 étapes :
    1. Sélection de service (liste filtrée par catégorie, description et documents requis).
    2. Détails (description générale + champs dynamiques par service : texte, email, date, nombre, textarea, select).
    3. Upload de documents (drag & drop, validation types/taille, aperçu fichiers, documents requis vs joints).
    4. Récapitulatif et soumission.
  - Liste des demandes avec filtres, statuts (en attente, en cours, approuvée, rejetée, terminée) et actions.
  - Détail d'une demande avec historique et documents.

- **Réclamations** :
  - Liste des réclamations avec filtres (recherche, statut : en attente, en cours, résolue, fermée).
  - Statistiques par statut.
  - Détail d'une réclamation (objet, contenu, dates, statut).
  - Création de nouvelle réclamation (non implémentée dans les fichiers lus, mais route prévue).
  - Actions : voir détails.

- **Documents** :
  - Gestion des documents personnels (upload, téléchargement, vue inline/forcée).
  - Validation sécurité (types, taille, UUID pour noms).
  - Intégration dans demandes et réclamations.

- **Profil et Paramètres** :
  - Mise à jour du profil agent.
  - Paramètres (thème, langue : FR/AR support via i18n).

- **Notifications** :
  - Liste des notifications (info, succès, warning, error) avec titre, message, date et actions.
  - Marquer comme lu individuellement ou tout marquer.
  - Navigation vers actions liées (ex. : détail de demande).

- **Autres** :
  - Support multilingue (FR/AR).
  - Thème personnalisable (dark/light).
  - Intercepteurs HTTP pour auth.

### 3. Fonctionnalités Transversales
- **Sécurité** : Authentification JWT, guards de rôle, validation des uploads (types : PDF, DOC, images ; max 10MB), protection contre path traversal.
- **Responsive Design** : Interface adaptée mobile/desktop avec Tailwind CSS et Angular Material.
- **Accessibilité** : Icônes, labels, états de chargement, erreurs claires.
- **Performance** : Lazy loading des modules, pagination implicite, images lazy-loaded.

## Architecture Technique

### Frontend (Angular 17+)
- **Framework** : Angular avec standalone components.
- **UI/UX** : Angular Material, Tailwind CSS, custom SCSS.
- **Services** : Gestion HTTP (intercepteurs auth), services pour auth, requests, complaints, notifications, news, contact, documents.
- **Routing** : Lazy loading, guards (auth, guest), résolvers.
- **Modèles** : Interfaces TypeScript pour User, Request, Complaint, Notification, Document.
- **Environnements** : Dev/Prod avec API URL configurable.
- **Autres** : i18n (FR/AR), RxJS pour observables, DomSanitizer pour HTML sécurisé.

### Backend (Spring Boot 3+)
- **Framework** : Spring Boot avec JPA/Hibernate.
- **Base de Données** : SQL (init.sql fourni), entités pour User, Request, Complaint, Notification, Document, Service.
- **API REST** : Endpoints pour auth (/auth/login), services (/api/services), requests (/api/requests), complaints (/api/reclamations), notifications (/api/notifications), documents (/api/documents, /upload/documents), news (/api/documents/public).
- **Sécurité** : Spring Security avec JWT, validation @Valid.
- **Configuration** : application.yml (dev/prod), Lombok pour boilerplate.
- **Docker** : Dockerfile et docker-compose pour déploiement.

### Déploiement
- **Conteneurs** : Docker pour backend (Maven) et frontend (Nginx/Angular build).
- **Environnements** : Multi-environnements (dev/prod) via profiles Spring et environment.ts Angular.
- **Base de Données** : Scripts SQL pour init (data.sql, data-services.sql).

## Installation et Configuration

### Prérequis
- Java 17+ et Maven (backend).
- Node.js 18+ et npm (frontend).
- Docker ( pour déploiement).
- Base de données PostgreSQL/MySQL.

### Backend
1. Cloner le repo : `git clone <repo-url>`.
2. Naviguer : `cd aos_micepp_public/aos_backend`.
3. Configurer `application.yml` (DB URL, JWT secret, upload dir).
4. Compiler : `mvn clean install`.
5. Lancer : `mvn spring-boot:run` (port 8090 par défaut).
6. Initialiser DB : Exécuter scripts SQL.

### Frontend
1. Naviguer : `cd aos_micepp_public/aos_frontend`.
2. Installer dépendances : `npm install`.
3. Configurer `environment.ts` (API URL : http://localhost:8090/AOS_MICEPP).
4. Lancer dev : `ng serve` (port 4200).
5. Build prod : `ng build --prod`.

### Déploiement Docker
- Backend : `docker build -t aos-backend .` puis `docker run -p 8090:8090 aos-backend`.
- Frontend : `docker build -t aos-frontend .` puis `docker run -p 80:80 aos-frontend`.
- Compose : `docker-compose up`.

## API Endpoints (Exemples)
- **Auth** : POST `/auth/login` (email/password) → JWT.
- **Services** : GET `/api/services` (liste), POST `/api/requests` (créer demande).
- **Documents** : POST `/upload/documents` (multipart, auth req.), GET `/documents/{filename}` (download).
- **News** : GET `/api/documents/public` (tous), GET `/documents/{id}/image` (blob).
- **Notifications** : GET `/api/notifications/user` (liste), PUT `/api/notifications/{id}/read`.
- **Réclamations** : GET `/api/reclamations/user`, POST `/api/reclamations`.

Tous les endpoints privés nécessitent `Authorization: Bearer <JWT>`.

## Support et Contribution
- **Contact** : contact@aos-micepp.ma ou formulaire en ligne.
- **Issues** : Signaler via GitHub Issues.
- **Contributions** : Fork, PR avec tests. Respecter conventions (Lombok, TypeScript strict).


© 2025 AOS MICEPP Developed by EL Khalfi Maryame. Tous droits réservés.
