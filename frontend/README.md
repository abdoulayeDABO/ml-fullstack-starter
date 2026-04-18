# Frontend Next.js (prédiction diabète)

Ce frontend appelle l'API FastAPI `POST /api/v1/predict`.

## Configuration

1. Copier le fichier d'environnement:

```bash
cp .env.example .env.local
```

1. Ajuster l'URL API si nécessaire:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Lancement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Build production

```bash
npm run build
npm run start
```
