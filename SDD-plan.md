# SDD Plan: Actualizar SDD.md al estado real

## Estado: COMPLETADO (v3.0 — 2026-06-20)

La migración a **Next.js 14 + FastAPI + PostgreSQL + Redis** está implementada. El SDD y el README reflejan ahora la arquitectura v2.

---

## Resumen de lo implementado vs roadmap

| Componente | Estado v3.0 |
|------------|-------------|
| Next.js 14 + Tailwind + shadcn/ui | Implementado |
| FastAPI async | Implementado |
| PostgreSQL (usuarios, incidentes, audits, consultas) | Implementado |
| Redis (cache scraps/sesiones) | Implementado |
| Proxy OSINT seguro (LeakOsint + XposedOrNot) | Implementado |
| Censura de credenciales + risk score | Implementado (backend) |
| Chart.js + Leaflet | Implementado |
| OpenAI GPT-4o-mini + FAISS RAG | Implementado (fallback offline) |
| Scraping Playwright + BS4 + aiohttp | Estructura + endpoint |
| JWT auth + demo bypass | Implementado |
| Admin verification queue + audit log | Implementado (PostgreSQL) |
| K-Anonymity (HIBP-style) | Roadmap |
| Tor pool / scrapers dark web en vivo | Roadmap |
| WebSockets live feed | Roadmap |
| Alertas push (Telegram/Slack/Email) | Roadmap |

---

## Legacy v1

La implementación anterior permanece en `legacy/`:

- `index.html`, `app.js`, `styles.css`
- `legacy/proxy/server.js` (Express)
- `legacy/functions/` (Firebase Cloud Functions)

Ejecutar: `npm run dev:legacy` → http://localhost:1337

---

## Próximos pasos sugeridos

1. Tests unitarios backend (`pytest`) para `exposure.py`, `censor.py`, routes OSINT
2. Tests frontend (`vitest`) para utilidades y componentes críticos
3. CI/CD con GitHub Actions (lint + test + docker build)
4. Implementar K-Anonymity en Exposure Check
5. Scrapers programados (cron) hacia Redis cada 15 min
