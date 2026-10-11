# JS MCQ

The repository contains three separate applications:

- `client/` — the learner-facing React application.
- `admin/` — the administrator React application.
- `backend/` — the Express API and MongoDB integration.

## Start all applications

Install the workspace dependencies once from the repository root:

```powershell
npm install
```

Configure MongoDB and the JWT secret in `backend\.env` using `backend\.env.example` as a template. Then start the client, admin, and API together with one command:

```powershell
npm run dev
```

- Learner client: `http://localhost:5173`
- Admin app: `http://localhost:5174`
- Backend API: `http://localhost:3000`

The Vite apps proxy `/api` requests to the backend during development. For API details, environment configuration, admin provisioning, and endpoint documentation, see [backend/README.md](./backend/README.md). For admin UI information, see [admin/README.md](./admin/README.md).

Content is organised as **technology › section › topic › question**. The learner client reads it from the backend's public API; admins manage it in the admin app. Topics and questions can be marked as premium (`isPaid`), in which case the API withholds the locked content and the learner app shows a membership prompt.

The learner client opens on the home page (`/`), with Courses (`/courses`) and Podcasts (`/podcasts`) in the same sidebar layout. Practice URLs follow the content structure: `/:technology/:section/:topic` (for example `/javascript/output-based/closures`).

Administrators register from the admin app's **Request access** screen. New accounts stay inactive until an existing administrator approves them on the **Administrators** page. On an empty database, activate the first account once in MongoDB; see [backend/README.md](./backend/README.md#administrator-accounts).

## Other commands

- `npm run build` — build the learner client and admin app.
- `npm run lint` — lint the learner client.
- `npm run dev:backend`, `npm run dev:client`, or `npm run dev:admin` — run one app.
