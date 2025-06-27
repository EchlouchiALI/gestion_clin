# 🏥 Polyclinique Atlas – Plateforme de gestion médicale moderne

Ce projet est une **application web complète** de gestion pour une clinique privée, développée dans le cadre d’un Projet de Fin d'Études. Il permet aux administrateurs, médecins et patients d'interagir de manière fluide, sécurisée et professionnelle.

---

## 🎯 Objectif du projet

Créer une **plateforme moderne, sécurisée et responsive** permettant à une clinique de :

- Gérer les utilisateurs (patients, médecins, admins)
- Planifier et suivre les rendez-vous
- Générer et envoyer des PDFs avec QR code
- Visualiser les statistiques d'activité
- Centraliser toutes les données médicales dans un système intuitif

---

## 👨‍⚕️ Fonctionnalités principales

### 🔐 Authentification (frontend + backend)
- Connexion / inscription
- JWT sécurisé
- Système de rôles (admin, médecin, patient)
- Réinitialisation de mot de passe par email

---

### 🧑‍⚕️ Espace Admin (`/dashboard/admin`)
- 📋 **Liste des utilisateurs** (patients + médecins)
  - Suppression
  - Mise à jour des rôles
  - Recherche, pagination, tri
- 🩺 **Gestion des patients**
  - Création, mise à jour, suppression
  - Recherche + envoi d’un message personnalisé par email
- 🗓️ **Gestion des rendez-vous**
  - Création de rendez-vous (liés patient + médecin)
  - Génération automatique de **PDF avec QR Code**
  - Envoi automatique par **email**
  - Visualisation, modification, suppression
  - Statistiques, filtres, vue calendrier
- 📊 **Dashboard**
  - Graphiques (Bar, Pie, Line) avec données dynamiques
  - Total de patients / médecins / rendez-vous
  - Vue d'ensemble personnalisée

---

### 👨‍⚕️ Espace Médecin (`/dashboard/medecin`)
- Voir ses rendez-vous à venir
- Détails du patient
- Marquer comme "Terminé" ou "Reporté"
- Rechercher ou trier ses rendez-vous

---

### 👨‍🎓 Espace Patient (`/dashboard/patient`)
- Voir ses rendez-vous à venir
- Télécharger son PDF (avec QR)
- Modifier ou annuler un rendez-vous
- Prendre un nouveau rendez-vous

---

## 🧰 Technologies utilisées

### Frontend (📦 `/frontend`)
- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS (design futuriste)
- Recharts (graphiques)
- Axios, React Hook Form

### Backend (📦 `/backend`)
- [NestJS](https://nestjs.com/)
- PostgreSQL + TypeORM
- Authentification JWT
- Nodemailer (envoi d'emails)
- `pdfkit` / `html-pdf` (PDF)
- `qrcode` (QR code)



