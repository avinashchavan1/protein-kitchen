# Protein Kitchen — Backend

Spring Boot (Java 21) API: Google OAuth login → self-issued JWT, per-user cloud sync, Web Push (VAPID). Postgres (Supabase) storage. Deploys to Render via Docker.

## Endpoints

| Method | Path                | Auth | Purpose |
|--------|---------------------|------|---------|
| GET    | `/api/health`       | no   | Keep-alive ping (cron-job.org) |
| POST   | `/api/auth/google`  | no   | Body `{idToken}` (Google ID token) → `{token, user}` |
| GET    | `/api/auth/me`      | JWT  | Current user |
| GET    | `/api/sync`         | JWT  | Read user state blob `{data, revision, updatedAt}` |
| PUT    | `/api/sync`         | JWT  | Replace user state (body = full state JSON) |
| GET    | `/api/push/key`     | no   | VAPID public key |
| POST   | `/api/push/subscribe` | JWT | Body `{endpoint, p256dh, auth}` |
| POST   | `/api/push/unsubscribe` | JWT | Body `{endpoint}` |
| POST   | `/api/push/test`    | JWT  | Send test push to caller's devices |

Send the JWT as `Authorization: Bearer <token>`.

## Data model (auto-created by Hibernate `ddl-auto=update`)
- `users` — id, google_sub (unique), email, name, picture, timestamps
- `user_state` — user_id (pk), data (jsonb), revision, updated_at
- `push_subscriptions` — id, user_id, endpoint (unique), p256dh, auth

## Environment

| Var | Required | Example / note |
|-----|----------|----------------|
| `SPRING_DATASOURCE_URL` | yes | `jdbc:postgresql://aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require` (pooler = IPv4) |
| `SPRING_DATASOURCE_USERNAME` | yes | `postgres.<project-ref>` |
| `SPRING_DATASOURCE_PASSWORD` | yes | Supabase DB password |
| `JWT_SECRET` | yes | ≥ 32 bytes random |
| `GOOGLE_CLIENT_ID` | yes (login) | OAuth Web client ID |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | yes (push) | see below |
| `VAPID_SUBJECT` | no | `mailto:you@example.com` |
| `FRONTEND_ORIGIN` | yes | CORS allow-list, comma-separated. `https://site.netlify.app,http://localhost:5173` |
| `PORT` | auto | Render injects it |

App boots without Google/VAPID keys — those features just return "not configured" until set.

### Generate VAPID keys
```bash
npx web-push generate-vapid-keys
# -> Public Key / Private Key (base64url). Put the public key in the frontend too.
```

### Google OAuth
Create an OAuth **Web application** client in Google Cloud Console. Add your Netlify origin to *Authorized JavaScript origins*. Use the client ID for `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend).

## Run locally
```bash
# needs a local Postgres, or point SPRING_DATASOURCE_URL at Supabase
mvn spring-boot:run
# or
mvn clean package -DskipTests && java -jar target/backend-1.0.0.jar
```

## Deploy (Render, free, Docker)
1. Push repo to GitHub.
2. Render → **New → Blueprint** → pick the repo (`render.yaml` at root).
3. Fill the `sync:false` env vars (DB, Google, VAPID, FRONTEND_ORIGIN). `JWT_SECRET` auto-generates.
4. Deploy. Health check path `/api/health`.
5. cron-job.org → new job → `GET https://<service>.onrender.com/api/health` every 5 min (defeats free-tier spin-down).

## Database (Supabase, free)
Create a project → Settings → Database → **Connection pooling** → *Session* mode → port `6543`. Use that host for IPv4 reachability from Render. Append `?sslmode=require`.
