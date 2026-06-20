# LeakGuard Frontend

Next.js 14 (App Router) + Tailwind CSS + shadcn/ui.

## Desarrollo

```powershell
cd frontend
npm install
npm run dev
```

Abrir http://localhost:3000

El frontend reescribe `/api/*` hacia el backend FastAPI (ver `next.config.mjs`).

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL del backend |

## Estructura

```
src/
├── app/                    # App Router pages
│   ├── page.tsx            # Landing
│   ├── login/
│   ├── dashboard/
│   ├── exposure/
│   ├── admin/
│   ├── ai-safety/
│   └── threats/[id]/
├── components/
│   ├── ui/                 # shadcn-style (button, card, input, badge)
│   ├── dashboard/          # Chart.js, Leaflet map
│   ├── layout/             # AppShell
│   └── auth/               # ProtectedRoute
├── contexts/auth-context.tsx
└── lib/
    ├── api.ts              # Cliente REST
    └── utils.ts            # cn() helper
```

## Stack UI

- **shadcn/ui** — componentes en `components/ui/` (Button, Card, Input, Badge)
- **Chart.js** + react-chartjs-2 — gráficos del dashboard
- **Leaflet** + react-leaflet — mapa de incidentes por país
- **lucide-react** — iconos

## Auth

- JWT almacenado en `localStorage` (`leakguard_token`)
- Demo bypass: `POST /api/v1/auth/demo`
- Rutas protegidas usan `<ProtectedRoute>`

## Build / Docker

```powershell
npm run build
npm start
```

Docker: ver `Dockerfile` y `docker-compose.yml` en la raíz.
