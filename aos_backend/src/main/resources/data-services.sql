-- Insert service info data
INSERT INTO service_info (icon, title, description) VALUES 
('directions_bus', 'Service de Transport', 'Assistance pour les déplacements et frais de transport des employés'),
('local_hospital', 'Santé Sociale', 'Prise en charge des frais médicaux et de santé'),
('home', 'Logement', 'Aide au logement et participation aux frais d''habitation'),
('child_care', 'Colonies de Vacances', 'Organisation de colonies de vacances pour les enfants des employés'),
('school', 'Appui Scolaire', 'Soutien scolaire et aide aux frais d''éducation'),
('sports', 'Activités Culturelles et Sportives', 'Organisation d''activités culturelles et sportives')
ON CONFLICT DO NOTHING;

-- Insert service features
INSERT INTO service_features (service_info_id, feature) VALUES
(1, 'Prise en charge des frais de transport domicile-travail'),
(1, 'Remboursement des frais de déplacement professionnel'),
(1, 'Abonnements transport en commun'),

(2, 'Remboursement des consultations médicales'),
(2, 'Prise en charge des médicaments'),
(2, 'Aide pour les frais dentaires et optiques'),

(3, 'Aide au loyer'),
(3, 'Prêts logement à taux préférentiel'),
(3, 'Assistance pour la recherche de logement'),

(4, 'Séjours organisés pour les enfants'),
(4, 'Activités éducatives et ludiques'),
(4, 'Encadrement professionnel'),

(5, 'Cours de soutien scolaire'),
(5, 'Aide aux devoirs'),
(5, 'Fournitures scolaires'),

(6, 'Événements culturels'),
(6, 'Tournois sportifs'),
(6, 'Ateliers créatifs')
ON CONFLICT DO NOTHING;

-- Insert services with IDs
INSERT INTO service (nom, type, service_info_id, is_active) VALUES 
('Transport Quotidien', 'TransportService', 1, TRUE),
('Assistance Médicale', 'SanteSocialeService', 2, TRUE),
('Aide au Logement', 'LogementService', 3, TRUE),
('Colonies de Vacances', 'ColonieVacanceService', 4, TRUE),
('Soutien Scolaire', 'AppuiScolaireService', 5, TRUE),
('Activités Loisirs', 'ActiviteCulturelleSportiveService', 6, TRUE)
ON CONFLICT DO NOTHING;

-- Insert specialized service data
INSERT INTO transport_service (id, trajet, point_depart, point_arrivee, frequence) VALUES 
(1, 'Domicile-Travail', 'Zone résidentielle', 'Siège social', 'Quotidien')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sante_sociale_service (id, type_soin, montant) VALUES 
(2, 'Consultations générales', 500.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO logement_service (id, type_logement, localisation_souhaitee, montant_participation) VALUES 
(3, 'Appartement', 'Centre-ville', 2000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO colonie_vacance_service (id, nombre_enfants, lieu_souhaite, periode) VALUES 
(4, 2, 'Station balnéaire', 'Juillet-Août')
ON CONFLICT (id) DO NOTHING;

INSERT INTO appui_scolaire_service (id, niveau, type_aide, montant_demande) VALUES 
(5, 'Collège', 'Cours particuliers', 300.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO activite_culturelle_sportive_service (id, type_activite, nom_activite, date_activite) VALUES 
(6, 'Sport', 'Tournoi de football', 'Week-end')
ON CONFLICT (id) DO NOTHING;
