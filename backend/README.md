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

## Content model

Content is organised as **technology › section › topic › question**:

- `technologies` — top-level entries in the learner sidebar (JavaScript, React, System Design). Fields: `name`, `slug`, `icon`, `order`, `isActive`.
- `sections` — groups inside a technology (Output Based, Concepts, Machine Coding). Fields: `technologyId`, `name`, `slug`, `order`, `isActive`. Slugs are unique per technology.
- `topics` — subjects inside a section (Closures, Promises). Fields: `technologyId`, `sectionId`, `name`, `slug`, `order`, `isActive`. Slugs are unique per section, so the same topic name can exist in several sections.
- `questions` — reference `technologyId`, `sectionId` and `topicId`. The API derives the technology and section from the topic, so clients only send `topicId`.

Lists are sorted by `order`, then name. Records with `isActive: false` (and everything under them) are hidden from the public API but still visible to admins. A record cannot be deleted while it has children.

### Migrating from topic › subtopic

Databases created before this structure store `topics` › `subtopics` › questions. Preview, then apply the one-off migration with the API stopped:

```powershell
npm run migrate-catalog --prefix backend            # dry run: prints the resulting tree
npm run migrate-catalog --prefix backend -- --apply # writes a JSON backup to backend/backups/, then migrates
```

Each old topic becomes a technology, each old subtopic becomes a topic inside one new section per technology (named by `MIGRATION_SECTION_NAME`, default `Output Based`), and questions are re-pointed with their content unchanged. Record IDs are preserved. The script refuses to run on an already-migrated database.

## API

### Public

- `GET /api/public/technologies` — active technologies › sections › topics, with `questionCount` on each section and topic.
- `GET /api/public/technologies/:technologySlug/sections/:sectionSlug/topics/:topicSlug/questions` — a topic's questions in display order, including the answer for the learner UI to reveal.

### Admin authentication

- `POST /api/auth/login` — body `{ "email": "...", "password": "..." }`.
- `GET /api/auth/me` — current authenticated administrator.
- `POST /api/auth/logout` — clears the session cookie.

Send credentials with browser requests (`credentials: 'include'`). The API only permits origins configured by `CLIENT_ORIGIN` and `ADMIN_ORIGIN`; state-changing browser requests with a different origin are rejected.

### Authenticated authoring

All paths below require the admin session cookie:

- `GET /api/admin/catalog` — the full tree including hidden records, with `questionCount` per topic.
- `POST /api/admin/technologies`; `PATCH`, `DELETE /api/admin/technologies/:id`.
- `POST /api/admin/technologies/:technologyId/sections`; `PATCH`, `DELETE /api/admin/sections/:id`.
- `POST /api/admin/sections/:sectionId/topics`; `PATCH`, `DELETE /api/admin/topics/:id`.
- `GET /api/admin/questions` (optional `technologyId`, `sectionId`, `topicId` filters), `POST /api/admin/questions`; `PATCH`, `DELETE /api/admin/questions/:id`.
- `PATCH /api/admin/questions/reorder` — body `{ "topicId": "<id>", "questionIds": ["<id>", "..."] }`; reorder every question in a topic.

`order` is optional when creating a technology, section or topic; new records are appended after their siblings.

Active records are available publicly as soon as they are created; use `isActive: false` to hide a technology, section or topic. Questions require a `topicId`, a title, a short-answer `answer`, and optional prompt content. Optional `mediumUrl` and `compilerUrl` fields accept HTTP(S) links, which the learner app displays as external resources. Questions have a display order within their topic; new questions are appended, and admins can reorder the full topic in the question library. Optional prompt content accepts `{ "kind": "text" | "code" | "json", "value": "..." }` parts, matching the learner UI’s mixed prompt style. The public question response includes the answer so the client can reveal it on demand; it is not an answer-submission or grading API.


All JSON errors use `{ "error": "..." }`; invalid request details are returned as a `details` array. Technology, section and topic deletion is blocked while child records exist.
