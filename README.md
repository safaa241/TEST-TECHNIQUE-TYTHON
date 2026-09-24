# ClinicFlow

Application de gestion de patients et rendez-vous pour une petite clinique.

## Fonctionnalités

- Authentification JWT avec rôle admin/staff
- Gestion des patients
- Recherche et pagination des patients
- Gestion des rendez-vous avec filtrage
- Contrôle métier : aucun patient ne peut avoir 2 rendez-vous confirmés dans une fenêtre de 30 minutes
- Dashboard statistique calculé côté base PostgreSQL
- Interface React responsive avec navigation côté clinique

## Stack technique

- Backend : Node.js, Express.js, PostgreSQL, JWT, bcrypt, Zod
- Frontend : React.js, React Router, Axios
- Base de données : PostgreSQL, UUID, indexes, contraintes, schéma SQL

## Architecture

- Backend : `routes -> controllers -> services -> database`
- Middlewares : authentification et rôle
- Validations Zod séparées par ressource
- Gestion centralisée des erreurs

## Prérequis

- Node.js 20+
- npm
- PostgreSQL 15+
- Optional : Docker pour lancer PostgreSQL via Compose

## Installation

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Configuration PostgreSQL

Créer une base `clinicflow` puis mettre les variables d’environnement :

```bash
createdb clinicflow
```

## Variables d’environnement

Copier le fichier d’exemple et adapter :

```bash
cp backend/.env.example backend/.env
```

Contenu attendu :

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://clinicflow:clinicflow@localhost:5432/clinicflow
JWT_SECRET=replace_me_with_a_strong_secret
FRONTEND_URL=http://localhost:5173
```

## Migrations / schéma

```bash
psql -U postgres -d clinicflow -f database/schema.sql
```

## Seed

```bash
psql -U postgres -d clinicflow -f database/seed.sql
```

## Lancement backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Lancement frontend

```bash
cd frontend
npm install
npm run dev
```

## API principale

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/patients`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/patients/:id`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/dashboard`

## Comptes de démonstration

- Admin : `admin@clinicflow.test` / `Admin123!`
- Staff : `staff@clinicflow.test` / `Staff123!`

## Règles métier

- Un patient ne peut pas avoir 2 rendez-vous confirmés dans une fenêtre de 30 minutes.
- Seuls les admin peuvent supprimer un patient.
- Le statut d’un rendez-vous doit être `pending`, `confirmed`, ou `cancelled`.

## Sécurité

- Mots de passe hashés avec bcrypt
- JWT sur les routes protégées
- Validation Zod sur les entrées utilisateur
- CORS configuré
- Aucun mot de passe ne sort de l’API
- Secrets uniquement dans `.env`

## Structure du projet

```text
clinicflow/
├─ backend/
│  ├─ src/
│  ├─ migrations/
│  ├─ seeds/
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  └─ src/
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
├─ docs/
│  └─ ERD.md
├─ docker-compose.yml
├─ README.md
└─ .gitignore
```

## Bonus

- Docker Compose simplifié avec PostgreSQL, backend et frontend.
- Tests backend de base (Jest + Supertest) si ajoutés plus tard.
