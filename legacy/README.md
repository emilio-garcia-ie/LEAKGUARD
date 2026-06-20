# Legacy LeakGuard v1

Aplicación vanilla (HTML + Tailwind CDN + `app.js`) con proxy Express y Firebase Functions.

## Desarrollo local

```powershell
cd legacy/proxy
npm install
copy .env.example .env
# Editar .env → OSINT_TOKEN=...  PORT=1337
node server.js
```

Desde la raíz del monorepo:

```powershell
npm run dev:legacy
```

→ http://localhost:1337

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Shell SPA |
| `app.js` | Motor frontend (~2000 líneas) |
| `styles.css` | Tema cyber dark |
| `proxy/server.js` | Proxy Express local |
| `functions/` | Firebase Cloud Functions (producción v1) |
| `firebase.json` | Hosting + rewrites |

## Nota

Esta versión se mantiene como referencia. **El stack activo es v2** en `frontend/` + `backend/`. Ver [README.md](../README.md).
