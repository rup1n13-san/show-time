# 🎟️ My Show Time

> **My Show Time** est une application web complète de gestion et réservation de billets de concerts, festivals et événements culturels.  
> Développée avec **NestJS**, **Prisma**, **MongoDB**, et **EJS**, elle propose à la fois un **frontoffice** pour les utilisateurs et un **backoffice** pour les administrateurs.

---

## 📌 Sommaire

- [Introduction](#introduction)
- [Fonctionnalités principales](#fonctionnalités-principales)
  - [Côté utilisateur](#côté-utilisateur)
  - [Côté administrateur](#côté-administrateur)
- [Stack technique](#stack-technique)
- [Architecture globale](#architecture-globale)
- [Installation locale](#installation-locale)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Déploiement sur Render](#déploiement-sur-render)
- [Évolutions futures](#évolutions-futures)
- [Licence](#licence)

---

## 🧩 Introduction

Le projet **My Show Time** est une plateforme de **réservation de tickets d’événements** qui combine :
- une **interface publique (frontoffice)** pour les utilisateurs,
- un **espace d’administration (backoffice)** pour la gestion des concerts, groupes et réservations.

Il permet aux utilisateurs de :
- consulter les concerts disponibles,
- s’inscrire, réserver des tickets,
- gérer leurs favoris et notifications,
- filtrer les événements par type, groupe ou date.

Les administrateurs peuvent :
- gérer les comptes utilisateurs,
- créer, modifier ou supprimer des événements,
- consulter les statistiques de réservation,
- administrer les groupes associés aux concerts.

---

## 🚀 Fonctionnalités principales

### 🎫 Côté utilisateur
- Parcourir la liste des concerts et festivals disponibles.
- S’inscrire / se connecter.
- Réserver un billet avec génération de QR Code.
- Consulter ses réservations.
- Gérer une **wishlist** de groupes favoris.
- Être notifié quand un groupe favori est programmé.
- Filtrer les événements par :
  - type (`CONCERT`, `FESTIVAL`, `SHOW`, etc.),
  - date,
  - groupe associé.

### 🧑‍💼 Côté administrateur
- Créer / modifier / supprimer un événement.
- Ajouter / supprimer des groupes musicaux.
- Lier plusieurs groupes à un événement.
- Gérer les utilisateurs (changer leur rôle en admin).
- Consulter les statistiques (tickets, ventes, réservations).
- Gérer les images via **Cloudinary**.
- Gérer les paiements via **Stripe**.

---

## ⚙️ Stack technique

| Technologie | Usage |
|--------------|-------|
| **NestJS** | Framework principal du backend |
| **Prisma ORM** | Gestion et typage de la base MongoDB |
| **MongoDB** | Base de données NoSQL |
| **EJS** | Moteur de template pour les vues côté serveur |
| **TailwindCSS** | Styling des pages EJS |
| **Multer** | Upload local d’images |
| **Cloudinary** | Hébergement et gestion des images d’événements |
| **Stripe** | Gestion du paiement des tickets |
| **Class-validator** | Validation des DTOs et données utilisateurs |

---

## 🧱 Architecture globale

L’application repose sur une architecture **modulaire** :
- `users/` → gestion des utilisateurs (CRUD, rôles, authentification)
- `events/` → gestion des événements, images, et associations groupes
- `groups/` → gestion des groupes musicaux
- `tickets/` → gestion des réservations et QR codes
- `prisma/` → configuration du client Prisma et du schéma
- `views/` → templates EJS pour le rendu côté serveur

---

## 💻 Installation locale

### 1️⃣ — Cloner le dépôt

```bash
git clone https://github.com/ramassage-tek/my_show_time.git
cd my_show_time
```
### 2️⃣ — Installer les dépendances
```bash
npm install
```
### 3️⃣ — Configurer l’environnement

Crée un fichier .env à la racine et copie les variables ci-dessous.
```
# === DATABASE ===
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/myshowtime"

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# === STRIPE ===
STRIPE_SECRET_KEY=
SITE_BASE_URL=http://localhost:3000

# === EMAIL SERVICE ===
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="MyShowTime <noreply@myshowtime.com>"
FRONTEND_URL=http://localhost:3000

```
### 4️⃣ — Générer le client Prisma

```bash 
npx prisma generate
```
### 5️⃣ — Lancer le serveur en développement
```bash
npm run start:dev
```

L’application sera accessible sur http://localhost:3000