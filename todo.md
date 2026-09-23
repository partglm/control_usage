🧩 Architecture finale des services
Service	Rôle unique
🧠 CORE	Fonctionnement interne de PC Manager
🏠 HOME	Dashboard / agrégation des informations
🖥️ SYSTEM	Matériel et informations système
📊 USAGE	Utilisation et monitoring temps réel
💾 STORAGE	Disques et stockage
📁 FILE	Système de fichiers
⚙️ GESTION	Contrôle de Windows
🌐 NET	Réseau
🔐 SECURITY	Sécurité Windows
👤 USERS	Comptes et sessions Windows
📦 APPS	Logiciels installés
🚀 PERF	Analyse et benchmarks
📝 LOG	Journaux et événements
💾 SAVE	Sauvegardes
🔄 AUTOMATE	Automatisation
🔔 NOTIF	Notifications
🌍 DEVICES	Liste et connexion aux PC distants
🔑 AUTH	Authentification de PC Manager
🧠 1. CORE — Cœur du logiciel

Rôle : faire fonctionner PC Manager lui-même.

 Chargement de la configuration YAML
 Chargement dynamique des services
 Activation / désactivation des services
 Gestion des dépendances entre services
 Gestion du cache
 Gestion du refresh
 Gestion des erreurs internes
 Système d'événements
 Event bus
 API interne
 Gestion des plugins
 Système d'extensions
 Logging interne de PC Manager
 
🏠 2. HOME — Dashboard

Rôle : afficher une synthèse. HOME ne possède aucune donnée.

Il récupère les informations auprès des autres services.

Dashboard
 Utilisation CPU
 Utilisation RAM
 Utilisation GPU
 Température CPU/GPU
 Utilisation stockage
 Débit réseau
 Nombre de processus
 État de la batterie
 Uptime
 Alertes importantes
 État des services
Interface
 Navigation entre services
 Widgets
 Dashboard personnalisable
 Thèmes
 Raccourcis
 Actions rapides

Par exemple :

HOME
 │
 ├── SYSTEM → CPU / GPU / RAM / température
 ├── USAGE  → utilisation actuelle
 ├── STORAGE → espace disque
 ├── NET → débit réseau
 ├── LOG → dernières erreurs
 └── NOTIF → alertes
🖥️ 3. SYSTEM — Matériel & informations système

Propriétaire de toutes les informations statiques sur la machine.

Matériel
 CPU
 GPU
 RAM
 Carte mère
 Écrans
 Périphériques USB
 Périphériques matériels
 Numéros de série
 Informations matérielles détaillées
Système
 Nom du PC
 Hostname
 OS
 Version Windows
 Architecture
 BIOS / UEFI
 Secure Boot
 TPM
 Uptime
 Batterie
 Pilotes
 Détection des périphériques défaillants
Températures
 Température CPU
 Température GPU
 Température carte mère
 Température autres composants

SYSTEM possède les températures, tandis que USAGE peut récupérer leur valeur pour les afficher dans le monitoring.

📊 4. USAGE — Utilisation en temps réel

Propriétaire des données de consommation instantanées.

CPU
 Utilisation CPU %
 Fréquence actuelle
 Charge par cœur
RAM
 RAM utilisée
 RAM disponible
 RAM totale
 Utilisation %
GPU
 Utilisation GPU %
 VRAM utilisée
 VRAM disponible
 VRAM totale
Disque
 Activité disque
 Débit lecture
 Débit écriture
Réseau
 Débit entrant
 Débit sortant
Système
 Charge système
 Nombre de processus actifs
Historique
 Historique CPU
 Historique RAM
 Historique GPU
 Historique disque
 Historique réseau
 Historique températures
 Graphiques
 Historique sur plusieurs jours/mois
💾 5. STORAGE — Stockage

Propriétaire des informations concernant les disques et leur espace.

 Liste des disques
 Disques physiques
 Partitions
 Volumes
 Systèmes de fichiers
 Capacité totale
 Espace utilisé
 Espace disponible
 Pourcentage utilisé
 Santé des disques
 SMART
 Détection des disques défaillants
 Analyse du stockage
 Fichiers volumineux
 Fichiers temporaires
 Nettoyage du stockage
📁 6. FILE — Fichiers

Propriétaire de la manipulation du système de fichiers.

 Explorateur de fichiers
 Navigation
 Création
 Suppression
 Renommage
 Copie
 Déplacement
 Copie / déplacement en masse
 Recherche
 Recherche par taille
 Recherche par extension
 Recherche par date
 Compression
 Décompression
 Permissions des fichiers
 Synchronisation de dossiers
 Corbeille
⚙️ 7. GESTION — Administration Windows

Propriétaire des actions permettant de modifier ou contrôler Windows.

Système
 Arrêt
 Redémarrage
 Veille
 Hibernation
 Déconnexion
Services Windows
 Liste des services
 Démarrer
 Arrêter
 Redémarrer
 Modifier le type de démarrage
Processus
 Liste des processus
 Lancer
 Arrêter
 Forcer l'arrêt
Windows
 Paramètres Windows
 Registre
 Variables d'environnement
 Fonctionnalités Windows
 Mises à jour Windows
 Tâches planifiées
 Applications au démarrage
🌐 8. NET — Réseau

Propriétaire de toute la configuration et du diagnostic réseau.

Configuration
 Adresse IP
 Adresse MAC
 DNS
 DHCP
 Passerelle
 Interfaces réseau
 Wi-Fi
 Ethernet
 Profils réseau
 Proxy
 VPN
 Tailscale
Diagnostic
 Ping
 Traceroute
 Test DNS
 Test de débit
 Diagnostic réseau
 Connexions TCP
 Connexions UDP
 Connexions actives
 Ports ouverts
Fonctions
 Pare-feu réseau
 Wake-on-LAN
🔐 9. SECURITY — Sécurité Windows

Propriétaire de la sécurité du système.

 Windows Defender
 Analyse antivirus
 Détection de logiciels suspects
 Pare-feu Windows
 BitLocker
 État des mises à jour de sécurité
 Alertes de sécurité
 Surveillance des changements système
 Détection d'activités suspectes
 Vérification des protections du système

TPM et Secure Boot restent dans SYSTEM car ce sont des informations matérielles/firmware ; SECURITY peut consulter leur état pour établir l'état de sécurité.

👤 10. USERS — Utilisateurs Windows

Propriétaire des comptes Windows.

 Liste des utilisateurs
 Créer un utilisateur
 Supprimer un utilisateur
 Modifier un compte
 Changer un mot de passe
 Verrouiller un compte
 Déverrouiller un compte
 Administrateur / standard
 Liste des groupes
 Créer un groupe
 Supprimer un groupe
 Ajouter à un groupe
 Retirer d'un groupe
 Sessions ouvertes
 Déconnexion d'un utilisateur
📦 11. APPS — Applications

Propriétaire des logiciels installés.

 Liste des programmes installés
 Recherche
 Installation
 Désinstallation
 Mise à jour
 Vérification des versions
 Détection des logiciels obsolètes
 Gestion des packages
 Winget
 Chocolatey
 Microsoft Store
 Lancement d'une application
 Fermeture d'une application
 Forcer la fermeture
🚀 12. PERF — Analyse des performances

Propriétaire de l'analyse et des benchmarks.

Contrairement à USAGE :

USAGE mesure → PERF analyse.

 Analyse des performances CPU
 Analyse des performances GPU
 Analyse RAM
 Analyse disque
 Analyse réseau
 Analyse des processus gourmands
 Analyse du démarrage
 Temps de démarrage Windows
 Détection des ralentissements
 Benchmark CPU
 Benchmark GPU
 Benchmark disque
 Benchmark réseau
 Suggestions d'optimisation
📝 13. LOG — Journaux

Propriétaire des événements historiques du système.

 Event Viewer
 Journaux système
 Journaux applications
 Journaux sécurité
 Erreurs Windows
 BSOD
 Codes d'erreur
 Historique des installations
 Historique des mises à jour
 Historique des connexions
 Recherche dans les logs
 Filtrage
 Exportation
 Alertes automatiques
 Base de données des événements
💾 14. SAVE — Sauvegardes

Propriétaire de la sauvegarde et récupération des données.

 Sauvegarde de fichiers
 Sauvegarde automatique
 Sauvegarde système
 Points de restauration
 Image disque
 Restauration
 Historique des sauvegardes
 Sauvegarde NAS
 Sauvegarde vers autre PC
 Synchronisation cloud
 Vérification des sauvegardes
 Planification
🔄 15. AUTOMATE — Automatisation

Propriétaire des déclencheurs et actions automatiques.

Déclencheurs
 Démarrage du PC
 Arrêt du PC
 Connexion utilisateur
 Démarrage d'un programme
 Arrêt d'un programme
 Connexion d'un périphérique
 Changement réseau
 Date / heure
 Condition personnalisée
Conditions
 CPU > X %
 RAM > X %
 Température > X °C
 Espace disque < X
 Programme actif
 Réseau déconnecté
 Événement système
Actions
 Lancer programme
 Arrêter programme
 Exécuter .bat
 Exécuter PowerShell
 Exécuter Python
 Exécuter commande
 Redémarrer
 Éteindre
 Envoyer notification
🔔 16. NOTIF — Notifications

Propriétaire de la distribution des notifications.

 Notification PC démarré
 Notification PC arrêté
 Programme lancé
 Programme terminé
 Température élevée
 Disque presque plein
 CPU élevé
 RAM élevée
 Connexion réseau perdue
 Nouvelle connexion utilisateur
 Erreur système
 Mise à jour disponible
 Notifications personnalisées
Fournisseurs
 ntfy
 Webhook
 API personnalisée
 Notification Windows
🌍 17. DEVICES — Liste des ordinateurs

Rôle extrêmement limité : gérer les machines connues.

DEVICES ne possède aucune information CPU/RAM/GPU/etc.

Il possède uniquement l'identité et la connexion :

interface Device {
    uuid: UUID;
    name: string;
    host: string;
    port: number;
    status: "online" | "offline";
    lastSeen: Date;
}

Fonctionnalités :

 Ajouter un PC
 Supprimer un PC
 Modifier un PC
 Liste des PC
 Identifier un PC par UUID
 Vérifier qu'un PC est joignable
 État online/offline
 Dernière connexion
 Connexion à un PC distant
 Déconnexion
 Gestion des PC hors ligne

Et c'est tout.

Les données du PC distant restent dans ses propres services.

DEVICES
   │
   ├── PC-Gaming
   │
   ├── PC-Portable
   │
   └── PC-Serveur

Si tu sélectionnes PC-Gaming :

DEVICES
    │
    ▼
PC-Gaming
    │
    ├── SYSTEM
    ├── USAGE
    ├── STORAGE
    ├── FILE
    ├── GESTION
    ├── NET
    ├── SECURITY
    ├── USERS
    ├── APPS
    ├── PERF
    ├── LOG
    ├── SAVE
    ├── AUTOMATE
    └── NOTIF
🔑 18. AUTH — Authentification

Propriétaire de l'accès à PC Manager, pas des utilisateurs Windows.

 Connexion à PC Manager
 Déconnexion
 Sessions
 Tokens
 Gestion des rôles
 Permissions
 Permissions par service
 Permissions par action
 Gestion de plusieurs utilisateurs
 Expiration des sessions
 HTTPS
 Audit des actions
🎯 Au final : qui possède quoi ?

C'est probablement la partie la plus importante pour ton architecture.

CPU
 ├── informations → SYSTEM
 └── utilisation   → USAGE

RAM
 ├── caractéristiques → SYSTEM
 └── utilisation      → USAGE

GPU
 ├── caractéristiques → SYSTEM
 └── utilisation      → USAGE

Disques
 ├── matériel/espace → STORAGE
 └── activité        → USAGE

Réseau
 ├── configuration → NET
 └── utilisation   → USAGE

Processus
 ├── gestion → GESTION
 └── consommation → USAGE

Températures
 └── SYSTEM

Logs
 └── LOG

Commandes
 └── GESTION
    (ou service propriétaire correspondant)

Notifications
 └── NOTIF

Historique
 ├── mesures → USAGE
 └── événements → LOG

Informations système
 └── SYSTEM

Liste des PC
 └── DEVICES

Dashboard
 └── HOME
    (agrège, ne possède pas)





ajout mode gaming: éteint tout services et export de monde mc + import fichier dans c:/pierrre/impor
raccourcis push project git
branch: manager server
    2: device server
ntfy priority 5

god, sousT