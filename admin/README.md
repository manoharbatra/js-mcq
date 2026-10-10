# JS MCQ Admin

Standalone React/Vite administrator interface for the JS MCQ API. It lives in `admin/` and does not change the existing learner client.

## Local setup

1. Configure and start the API using the instructions in [../backend/README.md](../backend/README.md).
2. Install and start this app from the repository root:

   ```powershell
   npm install --prefix admin
   npm run dev --prefix admin
   ```

3. Open `http://localhost:5174` and sign in using the administrator account provisioned through the backend CLI.

The development server proxies `/api` to `http://localhost:3000`. The backend `ADMIN_ORIGIN` must allow `http://localhost:5174`. For another API host, set `VITE_API_BASE_URL` when building/deploying the app.

## Included

- Admin login, current-session restoration, and logout using the API's HttpOnly cookie.
- Overview with topic, subtopic, question, and resource-link counts.
- Topic and subtopic creation, editing, and deletion.
- Short-answer question creation, editing, and deletion, including the answer shown to learners, optional Medium and online compiler links, and optional text/code/JSON prompt blocks. Code blocks can be formatted in the editor.
- Topic/subtopic/search filtering in the question library. Select one subtopic and clear the search to drag questions into their learner display order; arrow controls are also available for keyboard-based reordering.

New content is immediately available in the public learner app.
