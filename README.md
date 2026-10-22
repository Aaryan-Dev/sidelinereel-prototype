# SidelineReel: wrong-kid reel prevention (prototype)

A working prototype of the top roadmap item from the Ajaia PM assessment: when the system is unsure which kid is in a clip, it holds the clip for the coach instead of guessing. A product by [Ajaia](https://ajaia.ai).

**Three screens**

1. **Coach review**: uncertain clips (low confidence, a number not on the roster, or a number that is easy to confuse with another on the roster) wait here. The coach confirms, reassigns or excludes.
2. **Reels and send**: per-player reels, health signals, and the weekly send. Unresolved clips are left out, never guessed.
3. **Parent view**: a parent sees a reel and can tap "This isn't my kid".

Every visitor gets their own seeded demo session, so reviewers never see each other's clicks. "Reset demo" restores the original game.

## Layout

```
packages/shared   Domain types and the matching rules (used by API and web)
apps/api          Express + TypeScript + Prisma (Postgres)
apps/web          React + Vite, atomic design (atoms / molecules / organisms / templates / pages)
```

API layers: routes → controllers → services → repositories. Services depend on repository interfaces, so the API tests run against an in-memory fake with no database.

## Run locally

Needs Node 20+ and Docker.

```bash
npm install
cp .env.example apps/api/.env
npm run db:up        # Postgres on :5433
npm run db:migrate   # create tables
npm run dev          # API on :4000, web on :5173
```

Open http://localhost:5173.

## Checks

```bash
npm run lint
npm run typecheck
npm test             # shared + api + web
```

## Deploy (GCP + Neon, free tier)

- **Database**: Neon (free Postgres). Use the pooled connection string as `DATABASE_URL` and the direct one as `DIRECT_URL`.
- **API**: Cloud Run, built with `cloudbuild.yaml` into Artifact Registry.
- **Web**: Firebase Hosting, which also rewrites `/api/**` to Cloud Run so the browser sees one origin (no CORS, no API URL in the build).

```bash
# 1. Migrate the database (from your machine)
DATABASE_URL="<neon pooled>" DIRECT_URL="<neon direct>" npm run db:deploy

# 2. Store the connection strings as secrets
printf '%s' "<neon pooled>" | gcloud secrets create sidelinereel-database-url --data-file=- --project <project>

# 3. Build and deploy the API
gcloud builds submit --config cloudbuild.yaml --project <project> .
gcloud run deploy sidelinereel-api \
  --image us-central1-docker.pkg.dev/<project>/sidelinereel/api:latest \
  --region us-central1 --allow-unauthenticated --min-instances 0 \
  --set-secrets DATABASE_URL=sidelinereel-database-url:latest \
  --set-env-vars TRUST_PROXY=2 --project <project>

# 4. Build and deploy the web app
npm run build -w @sidelinereel/web
firebase deploy --only hosting --project <project>
```

Cloud Run scales to zero, so the first request after a quiet period takes a few seconds.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (pooled in production) |
| `DIRECT_URL` | Direct connection used by `prisma migrate` |
| `PORT` | Set by Cloud Run |
| `CORS_ORIGIN` | Comma-separated origins; leave empty when served same-origin |
| `TRUST_PROXY` | Reverse proxies in front of the API, for client IPs in rate limiting |
| `LOG_LEVEL` | `info` by default |
