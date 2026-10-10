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

The learner client loads topics, subtopics, and short-answer questions directly from the backend public API. The former bundled question dataset has been removed.

To provision the first admin separately, run `npm run create-admin` from the repository root. The account details are currently read by `backend/scripts/create-admin.js`; use a password that meets that script’s minimum length and do not commit real credentials.

## Other commands

- `npm run build` — build the learner client and admin app.
- `npm run lint` — lint the learner client.
- `npm run dev:backend`, `npm run dev:client`, or `npm run dev:admin` — run one app.
