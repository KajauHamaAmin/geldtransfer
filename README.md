# Geldtransfer-Verwaltung

Eine moderne, elegante Webanwendung zur Verwaltung von Geldtransfer-Transaktionen (Western Union, RIA, MoneyGram).

## 🚀 Features

- **Vollständige Transaktionsverwaltung**: Einzahlungen, Auszahlungen und Drops
- **Provider-spezifische Umsätze**: Separate Übersichten für WU, RIA und MoneyGram
- **Rollenbasierte Zugriffskontrolle**: Owner, Admin, Manager und Mitarbeiter
- **Modernes Premium-Design**: Glasmorphism-Stil mit eleganten Animationen
- **Responsive UI**: Optimiert für alle Bildschirmgrößen

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS mit Custom CSS-Variablen
- **Backend**: Next.js Server Actions, Prisma ORM
- **Datenbank**: SQLite mit Prisma Migrations
- **Authentifizierung**: Iron-Session für sichere Sessions
- **Validierung**: Zod-Schemas

## 📦 Installation

1. **Repository klonen**:
```bash
git clone https://github.com/KajauHamaAmin/geldtransfer.git
cd geldtransfer
```

2. **Abhängigkeiten installieren**:
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren**:
```bash
cp .env.example .env.local
# SESSION_SECRET und DATABASE_URL in .env.local setzen
```

4. **Datenbank einrichten**:
```bash
npx prisma migrate dev
npm run seed
```

5. **Entwicklungsserver starten**:
```bash
npm run dev
```

## 🔐 Standard-Anmeldedaten

- **Owner**: `owner` / `Admin@1234`
- **Manager**: `manager` / `Manager@1234`
- **Mitarbeiter**: `mitarbeiter` / `Mitarbeiter@1234`

## 🌐 Verfügbare Routen

- `/` - Startseite mit Übersicht
- `/transfers` - Transaktionsverwaltung
- `/admin` - Mitarbeiterverwaltung (nur Admin/Owner)
- `/auth/signin` - Anmeldeseite

## 📊 Transaktions-Typen

- **SEND**: Einzahlung (wird zum Gesamtumsatz addiert)
- **PAYOUT**: Auszahlung (wird vom Gesamtumsatz abgezogen)
- **DEDUCTION**: Drop/Abzug (wird vom Gesamtumsatz abgezogen)

## 🎨 Design-Features

- **Glasmorphism-Effekte**: Moderne, elegante Benutzeroberfläche
- **Responsive Layout**: Optimiert für Desktop und Mobile
- **Smooth Animationen**: CSS-basierte Übergänge und Effekte
- **Premium-Feeling**: Professionelle Farbpalette und Typografie

## 🔧 Entwicklung

```bash
# Datenbank-Schema aktualisieren
npx prisma db push

# Neue Migration erstellen
npx prisma migrate dev --name migration_name

# Datenbank zurücksetzen
npx prisma migrate reset

# Seed-Daten hinzufügen
npm run seed
```

## 📝 Lizenz

Dieses Projekt ist für den internen Gebrauch bestimmt.

## 🤝 Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.
