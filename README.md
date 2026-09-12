# PC Manager

Gestionnaire local de PC modulaire en Node.js + TypeScript.

## Architecture

- `src/server.ts` : serveur HTTP principal
- `src/services/` : services indépendants
- `src/public/` : interface web
- `src/services/system.ts` : informations et statistiques système
- `src/services/processes.ts` : processus
- `src/services/network.ts` : réseau
- `src/services/storage.ts` : disques
- `src/services/apps.ts` : programmes Windows installés

La page `/` sert de portail et permet d'ouvrir chaque service.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir :

`http://localhost:8080`

Pour compiler :

```bash
npm run build
npm start
```

## Ajouter un service

1. Créer `src/services/mon-service.ts`.
2. Exporter un objet contenant `id`, `name`, `description`, `icon`, `api` et `page`.
3. L'ajouter dans `src/services/index.ts`.
4. Créer sa page dans `src/public/services/`.

Les services sont volontairement séparés pour pouvoir ajouter ensuite sécurité, sauvegardes, Wake-on-LAN, tâches planifiées, notifications, etc.
