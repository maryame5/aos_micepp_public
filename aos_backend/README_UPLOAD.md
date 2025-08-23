# Système d'Upload des Documents

## Vue d'ensemble

Ce système permet l'upload, le stockage et la récupération de documents dans l'application AOS MICEPP.

## Endpoints disponibles

### 1. Upload de documents
- **URL**: `POST /upload/documents`
- **Authentification**: Requise (utilisateur connecté)
- **Type**: `multipart/form-data`
- **Paramètre**: `documents` (array de fichiers)

**Exemple de requête cURL :**
```bash
curl -X POST \
  http://localhost:8090/AOS_MICEPP/upload/documents \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'documents=@document1.pdf' \
  -F 'documents=@document2.jpg'
```

**Réponse de succès :**
```json
{
  "success": true,
  "documentPaths": [
    "uploads/uuid1.pdf",
    "uploads/uuid2.jpg"
  ],
  "message": "Successfully uploaded 2 documents"
}
```

### 2. Téléchargement de documents
- **URL**: `GET /documents/{filename}`
- **Authentification**: Requise
- **Comportement**: Affichage inline du document

### 3. Téléchargement forcé
- **URL**: `GET /documents/download/{filename}`
- **Authentification**: Requise
- **Comportement**: Téléchargement forcé du fichier

## Configuration

### Propriétés dans `application.properties` :
```properties
# Dossier d'upload (relatif au répertoire de travail)
app.upload.dir=uploads

# Taille maximale par fichier (en bytes, 10MB par défaut)
app.upload.max-file-size=10485760

# Extensions autorisées
app.upload.allowed-extensions=pdf,doc,docx,jpg,jpeg,png,txt

# Configuration multipart Spring
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true
```

## Sécurité

- **Authentification requise** pour tous les endpoints
- **Validation des types de fichiers** (extensions autorisées)
- **Validation de la taille** des fichiers
- **Noms de fichiers uniques** générés avec UUID
- **Chemins normalisés** pour éviter les attaques path traversal

## Stockage

- Les fichiers sont stockés dans le dossier `uploads/` (configurable)
- Chaque fichier reçoit un nom unique basé sur UUID
- L'extension originale est préservée
- Les chemins relatifs sont stockés en base de données

## Gestion des erreurs

### Erreurs de validation :
- Fichier vide
- Taille excessive
- Extension non autorisée
- Type MIME invalide

### Erreurs système :
- Erreurs d'écriture disque
- Fichier non trouvé
- Erreurs d'autorisation

## Utilisation dans le frontend

Le frontend Angular utilise le service `FileUploadService` qui :
1. Envoie les fichiers via `FormData`
2. Gère les réponses et erreurs
3. Implémente un mécanisme de fallback si l'upload échoue

## Maintenance

### Nettoyage des fichiers :
- Les fichiers orphelins peuvent être supprimés manuellement
- Le dossier `uploads/` est exclu du contrôle de version
- Considérer une tâche de nettoyage automatique pour les anciens fichiers

### Monitoring :
- Logs détaillés pour chaque upload
- Métriques de taille et nombre de fichiers
- Gestion des erreurs avec stack traces

## Dépannage

### Problèmes courants :
1. **Erreur 403** : Vérifier l'authentification JWT
2. **Erreur 413** : Fichier trop volumineux
3. **Erreur 500** : Problème de permissions sur le dossier d'upload

### Vérifications :
- Existence du dossier `uploads/`
- Permissions d'écriture
- Espace disque disponible
- Configuration multipart dans Spring Boot
