# SDLC Control Plane

A runnable starter repo for a **central control-plane app** for your Odoo modules.

It supports:

- per-app installations
- per-app entitlements (free / trial / active / expired / suspended)
- app version + Odoo compatibility tracking
- health and failure streaks
- support notes
- audit logs
- release channel + upgrade-needed flags
- remote command queue (poll + ack)

## Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Storage:** in-memory (for demo / starter only)

The backend keeps data in memory, so restarting the server resets demo data.
This is intentional for a simple MVP. Replace it with Postgres later.

## Repo layout

```text
sdlc-control-plane/
  server/
    src/
      data/
      routes/
      services/
      server.js
  web/
    src/
      components/
      pages/
      App.jsx
      api.js
      main.jsx
      styles.css
```

## Quick start

### 1) Install dependencies

From the repo root:

```bash
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../web && npm install
```

### 2) Start the API

```bash
npm run dev:server
```

Backend runs at:

```text
http://localhost:4000
```

### 3) Start the React app

In a second terminal:

```bash
npm run dev:web
```

Frontend runs at:

```text
http://localhost:5173
```

## First demo flow

1. Open the React app.
2. Go to **Dashboard**.
3. Click **Bootstrap Demo Data**.
4. Open the tabs:
   - **Installations**
   - **Entitlements**
   - **Health**
   - **Releases**
   - **Audit**
   - **Support**

That creates a demo customer, a demo Odoo instance, and installs these apps:

- `sdlc_shopify_connector`
- `project_costing`
- `sdlc_emp_dashboard`

## Important routes

### Core
- `POST /api/register`
- `POST /api/demo/bootstrap`
- `POST /api/heartbeat`
- `GET /api/dashboard`

### Installations
- `GET /api/installations`
- `GET /api/installations/:installationId`
- `PATCH /api/installations/:installationId`

### Entitlements
- `GET /api/entitlements/:installationId`
- `POST /api/entitlements/:installationId/override`

### Health / releases / audit
- `GET /api/health/exceptions`
- `GET /api/releases/summary`
- `GET /api/audit-logs`

### Support notes
- `GET /api/support/notes`
- `POST /api/support/notes`

### Remote commands
- `POST /api/commands`
- `GET /api/commands/poll/:instanceId`
- `POST /api/commands/ack/:commandId`

## Example payloads

### Register an Odoo database and apps

```json
{
  "dbUuid": "db-123",
  "baseUrl": "https://customer.example.com",
  "odooVersion": "17.0",
  "companyName": "Acme Inc",
  "companyEmail": "owner@acme.com",
  "modules": [
    "sdlc_shopify_connector",
    "project_costing"
  ]
}
```

### Manual entitlement override

```json
{
  "state": "expired",
  "reason": "Subscription ended",
  "actor": "admin"
}
```

### Create a remote command

```json
{
  "installationId": "INSTALLATION_ID",
  "type": "show_message",
  "payload": {
    "message": "Renew your license to restore premium sync."
  },
  "actor": "admin"
}
```

## Production upgrades you should add later

- Postgres
- Prisma / Drizzle ORM
- auth and role-based access
- signed entitlements (JWT or Ed25519)
- background jobs / retry queue
- rate limiting
- customer billing integration
- real Odoo client addon (`sdlc_control_base`)

## Notes

This repo is designed to be **clear and hackable first**.
It is a good foundation for your next step: connecting your real Odoo addon to the API.

