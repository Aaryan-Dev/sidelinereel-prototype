# SidelineReel: wrong-kid reel prevention (prototype)

A working prototype of the top roadmap item from the Ajaia PM assessment: when the system is unsure which kid is in a clip, it holds the clip for the coach instead of guessing. A product by [Ajaia](https://ajaia.ai).

**Live:** https://sidelinereel-demo.web.app

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
npm test             # shared + api + web (55 tests)
```

## Deploy (Google Cloud)

This is how the live site is deployed:

- **Web**: Firebase Hosting. It also rewrites `/api/**` to Cloud Run, so the browser sees one origin (no CORS, no API URL in the build).
- **API**: Cloud Run, built with `cloudbuild.yaml` into Artifact Registry. It runs as its own service account with only the Cloud SQL Client role and access to one secret.
- **Database**: Cloud SQL for PostgreSQL, smallest size (`db-f1-micro`, single zone, HDD, no backups). The API connects through the Cloud SQL socket, and the connection string lives in Secret Manager.

Use your own project ID. In zsh, keep the braces around variables (`${PROJECT_ID}`); plain `$PROJECT_ID:us...` is read as a case modifier.

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export CONN="${PROJECT_ID}:${REGION}:sidelinereel-db"
export SA="sidelinereel-api@${PROJECT_ID}.iam.gserviceaccount.com"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/sidelinereel/api:latest"

# 1. One-time setup
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com sqladmin.googleapis.com --project "${PROJECT_ID}"
gcloud artifacts repositories create sidelinereel --repository-format=docker --location "${REGION}" --project "${PROJECT_ID}"
gcloud sql instances create sidelinereel-db --database-version=POSTGRES_16 --edition=ENTERPRISE \
  --tier=db-f1-micro --region "${REGION}" --availability-type=ZONAL --storage-type=HDD \
  --storage-size=10GB --no-storage-auto-increase --no-backup --project "${PROJECT_ID}"
gcloud sql databases create sidelinereel --instance sidelinereel-db --project "${PROJECT_ID}"
PASS=$(openssl rand -base64 33 | tr -dc 'A-Za-z0-9' | head -c 28)
gcloud sql users create sidelinereel --instance sidelinereel-db --password "${PASS}" --project "${PROJECT_ID}"
printf '%s' "postgresql://sidelinereel:${PASS}@localhost/sidelinereel?host=/cloudsql/${CONN}" \
  | gcloud secrets create sidelinereel-database-url --data-file=- --project "${PROJECT_ID}"
gcloud iam service-accounts create sidelinereel-api --project "${PROJECT_ID}"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" --member "serviceAccount:${SA}" --role roles/cloudsql.client
gcloud secrets add-iam-policy-binding sidelinereel-database-url --member "serviceAccount:${SA}" \
  --role roles/secretmanager.secretAccessor --project "${PROJECT_ID}"

# 2. Build the API image
gcloud builds submit --config cloudbuild.yaml --project "${PROJECT_ID}" .

# 3. Migrate the database (a one-off Cloud Run job using the same image)
gcloud run jobs deploy sidelinereel-migrate --image "${IMAGE}" --region "${REGION}" --project "${PROJECT_ID}" \
  --service-account "${SA}" --set-cloudsql-instances "${CONN}" \
  --set-secrets DATABASE_URL=sidelinereel-database-url:latest,DIRECT_URL=sidelinereel-database-url:latest \
  --command node --args node_modules/prisma/build/index.js,migrate,deploy --max-retries 0
gcloud run jobs execute sidelinereel-migrate --region "${REGION}" --project "${PROJECT_ID}" --wait

# 4. Deploy the API (scales to zero, capped at 3 instances)
gcloud run deploy sidelinereel-api --image "${IMAGE}" --region "${REGION}" --project "${PROJECT_ID}" \
  --service-account "${SA}" --add-cloudsql-instances "${CONN}" \
  --set-secrets DATABASE_URL=sidelinereel-database-url:latest \
  --set-env-vars NODE_ENV=production,TRUST_PROXY=2 \
  --min-instances 0 --max-instances 3 --memory 512Mi --allow-unauthenticated

# 5. Deploy the web app (create the Hosting site once, and set its ID in .firebaserc)
npm run build -w @sidelinereel/web
firebase hosting:sites:create sidelinereel-demo --project "${PROJECT_ID}"
firebase deploy --only hosting --project "${PROJECT_ID}"
```

Cloud Run scales to zero, so the first request after a quiet period takes a few seconds. To tear everything down, delete the Cloud SQL instance first (it is the only part that costs money), then the Cloud Run service and job, the Hosting site, the Artifact Registry repo, the secret and the service account.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `DIRECT_URL` | Direct connection used by `prisma migrate` (the same URL here) |
| `PORT` | Set by Cloud Run |
| `CORS_ORIGIN` | Comma-separated origins; leave empty when served same-origin |
| `TRUST_PROXY` | Reverse proxies in front of the API, for client IPs in rate limiting |
| `LOG_LEVEL` | `info` by default |
