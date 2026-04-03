# Mini Marketplace — Frontend

A lightweight React + Vite frontend for the Mini Marketplace application.

**Project**: mini-marketplace-frontend

**Tech stack:** React, Vite, Axios, React Router

**Quick summary**
- Single-page React app built with Vite.
- Connects to a REST API (see REST_API_DESIGN.md).

**Features**
- User authentication (register/login/profile)
- Product browsing and details
- Create / edit products (seller flows)
- Orders and order details
- Admin views for users, categories and orders

**Prerequisites**
- Node.js 18+ and npm

**Environment**
Create a local env file (for example `.env.local`) and set the API base URL used by the frontend:

```
VITE_API_BASE_URL=https://api.example.com
```

The frontend uses Vite and expects environment variables prefixed with `VITE_`.

**Install**

```bash
npm install
```

**Development**

```bash
npm run dev
```

This runs the development server (Vite). Open the URL printed in the terminal (usually http://localhost:5173).

**Build**

```bash
npm run build
```

**Preview production build**

```bash
npm run preview
```

**NPM scripts (from package.json)**
- `dev` — start Vite dev server
- `build` — build for production
- `preview` — locally preview the production build

**API integration**
- API requests are centralized in `src/api` (Axios helpers and per-resource modules).
- For backend contract details, see [REST_API_DESIGN.md](REST_API_DESIGN.md).

**Folder overview**
- `src/` — application source
  - `api/` — axios setup and API modules
  - `components/` — reusable UI components and route guards
  - `context/` — authentication context
  - `pages/` — route pages and admin pages

**Notes & tips**
- Ensure the backend is running and `VITE_API_BASE_URL` points to it.
- If you change env vars, restart the dev server.

**Contributing**
- Open an issue or send a pull request with clear intent and tests/examples when relevant.

**License**
- See repository root for license information.
