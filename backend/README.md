# JS MCQ API

Standalone Express and MongoDB API. The existing Vite client remains at the repository root and is not modified by this backend.

## Structure

```text
backend/
  scripts/             Trusted CLI tools, including first-admin provisioning
  src/
    config/            Environment validation and MongoDB connection lifecycle
    models/             Mongoose schemas and indexes
    routes/             HTTP routes, request validation, and response shaping
    services/           Authentication and content/business operations
    utils/              Shared auth middleware, validation schemas, and errors
    app.js              Express middleware and route registration
    server.js           Database-first startup and graceful shutdown
```

Request flow is `route -> validation -> service -> model/database -> route response`; shared middleware and errors live in `utils/`.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB 6+

## Setup

From the repository root, create the backend environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set `MONGODB_URI` to the connection URI for the MongoDB instance you want to use and set `JWT_SECRET` to a cryptographically random value of at least 32 characters in `backend\.env`. The two origin variables must match the client and admin web origins exactly. The API loads this file directly from `backend\.env`, validates required settings at startup, and waits for `mongoose.connect()` to succeed before listening for requests. It will not start with a missing or invalid MongoDB URI.

Install the API dependencies and start the backend:

```powershell
npm install --prefix backend
npm run dev --prefix backend
```

The health endpoint is `GET http://localhost:3000/api/health`.

## Provision the first admin

There is no public admin registration endpoint. Create the first account from a trusted terminal; do not commit credentials or pass the password as a command-line argument.

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$securePassword = Read-Host "Admin password" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
npm run create-admin --prefix backend
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

Use a unique password of at least 12 characters. Admin login issues a short-lived JWT in an HttpOnly, SameSite=Strict cookie; production also requires HTTPS.

## API

### Public

- `GET /api/public/topics` — all topics with their subtopics.
- `GET /api/public/topics/:topicSlug/subtopics/:subtopicSlug/questions` — short-answer questions, including the answer for the learner UI to reveal.

### Admin authentication

- `POST /api/auth/login` — body `{ "email": "...", "password": "..." }`.
- `GET /api/auth/me` — current authenticated administrator.
- `POST /api/auth/logout` — clears the session cookie.

Send credentials with browser requests (`credentials: 'include'`). The API only permits origins configured by `CLIENT_ORIGIN` and `ADMIN_ORIGIN`; state-changing browser requests with a different origin are rejected.

### Authenticated authoring

All paths below require the admin session cookie:

- `GET`, `POST /api/admin/topics`; `PATCH`, `DELETE /api/admin/topics/:id`.
- `POST /api/admin/topics/:topicId/subtopics`; `PATCH`, `DELETE /api/admin/subtopics/:id`.
- `GET`, `POST /api/admin/questions`; `PATCH`, `DELETE /api/admin/questions/:id`.

Topics, subtopics, and questions are available publicly as soon as they are created; there is no publish/draft state. Questions require a topic, its subtopic, a title, a short-answer `answer`, and optional prompt content. Optional `mediumUrl` and `compilerUrl` fields accept HTTP(S) links, which the learner app displays as external resources. No answer choices, correctness checks, or manual display ordering are used. Topics and subtopics are listed by name; questions are listed by creation time. Optional prompt content accepts `{ "kind": "text" | "code" | "json", "value": "..." }` parts, matching the learner UI’s mixed prompt style. The public question response includes the answer so the client can reveal it on demand; it is not an answer-submission or grading API.


All JSON errors use `{ "error": "..." }`; invalid request details are returned as a `details` array. Topic and subtopic deletion is blocked while child records exist.
