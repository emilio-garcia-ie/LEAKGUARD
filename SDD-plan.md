# SDD Plan: Evolución de LeakGuard

**Estado:** Plan de alineación SDD ↔ código **COMPLETADO** (SDD v3.1 — 2026-06-20)  
**Documento vivo:** backlog y tareas pendientes para cerrar brechas entre SDD y producto  
**Fuente de verdad:** [SDD.md](SDD.md) · Historial: [CHANGELOG.md](CHANGELOG.md)

---

## 1. Resumen

| Fase | Estado | Objetivo |
|------|--------|----------|
| **A — Alineación documentación** | ✅ Completada | SDD v3.1 refleja código real con estados ✅ / ⚠️ / 🔜 |
| **B — Calidad y tests** | ⚠️ En progreso | pytest + vitest + smoke tests (SDD §9) |
| **C — Privacidad y scraping** | 🔜 Pendiente | K-Anonymity, scrapers autónomos, cron → Redis |
| **D — Inteligencia avanzada** | 🔜 Pendiente | OTX/Ransomware.live, resúmenes ejecutivos, alertas push |
| **E — Producción** | 🔜 Pendiente | WebSockets, Tor pool, CI/CD, deploy |

---

## 2. Completado (no reabrir salvo regresión)

### Stack v2
- [x] Next.js 14 + Tailwind + shadcn/ui (`frontend/`)
- [x] FastAPI async + SQLAlchemy (`backend/`)
- [x] PostgreSQL: users, incidents, audit_logs, consulted_scans
- [x] Redis: cache de scraps (`backend/app/core/redis_client.py`)
- [x] Docker Compose: postgres, redis, backend, frontend

### Funcionalidad core
- [x] Proxy OSINT seguro — `backend/app/services/osint.py`
- [x] XposedOrNot merge — `backend/app/services/breach.py`
- [x] Censura server-side — `backend/app/services/censor.py`
- [x] Risk score 0–99 — `backend/app/services/exposure.py`
- [x] Exposure Check UI — `frontend/src/app/exposure/page.tsx`
- [x] Dashboard KPIs + Chart.js + Leaflet — `frontend/src/app/dashboard/`
- [x] Admin verify/reject + audit log — `frontend/src/app/admin/page.tsx`
- [x] JWT auth + demo bypass — `backend/app/api/routes/auth.py`
- [x] AI Safety metrics — `GET /api/v1/dashboard/ai-safety`
- [x] RAG básico + OpenAI fallback — `backend/app/services/ai_rag.py`
- [x] Scrape URL (BS4 + Playwright opcional) — `POST /api/v1/scrape`

### Documentación y tooling
- [x] SDD v3.1 con módulos 1–11 y tabla API
- [x] Legacy v1 en `legacy/` (`npm run dev:legacy`)
- [x] Cursor rules en `.cursor/rules/` (7 archivos)

---

## 3. Brechas conocidas (SDD vs código)

| Brecha | SDD dice | Código hoy | Prioridad |
|--------|----------|------------|-----------|
| K-Anonymity | Búsqueda anónima HIBP-style | Consulta directa + `consulted_scans` guarda query | Alta |
| Scrapers dark web | Blogs ransomware, foros, cron 15 min | Scrape genérico por URL; incidentes = seed DB | Alta |
| Verificación OSINT | OTX + Ransomware.live | No integrado | Media |
| Alertas push | Telegram/Slack/email | Solo alerta XposedOrNot en login/registro | Media |
| Live feed | WebSockets / SSE | REST polling manual | Baja |
| Tor pool | 5 circuitos .onion | No existe | Baja |
| RAG completo | 50 casos + embeddings reales | 4 docs + vectores simplificados | Media |
| Tests | 70% backend / 50% frontend | Sin suite implementada | **Alta** |
| Resumen ejecutivo | Prompt JSON 20 palabras + cache | Solo `/ai/analyze` genérico | Baja |

---

## 4. Plan de ejecución

### Fase B — Tests y calidad (prioridad inmediata)

**Objetivo:** Cumplir SDD §9 antes de añadir features grandes.

| Tarea | Archivos | Criterio de aceptación |
|-------|----------|------------------------|
| B1. Unit tests exposure | `backend/tests/test_exposure.py` | `calculate_real_risk_percent`, `parse_osint_response` con casos borde |
| B2. Unit tests censor | `backend/tests/test_censor.py` | Password, email, hash, phone censurados correctamente |
| B3. Unit tests routes | `backend/tests/test_exposure_routes.py` | 400 sin request, 503 sin token, CORS OK |
| B4. Smoke script | `scripts/smoke.sh` o `backend/tests/test_smoke.py` | `/health`, `/api/v1/threats`, scan responde |
| B5. Frontend vitest | `frontend/src/lib/__tests__/api.test.ts` | Cliente API mockeado |
| B6. CI GitHub Actions | `.github/workflows/ci.yml` | lint + pytest + build docker en PR |

**Comando local sugerido:**
```bash
cd backend && pytest
cd frontend && npm test
```

---

### Fase C — Privacidad y recolección

**Objetivo:** Cerrar Módulos 1 y 6 del SDD.

| Tarea | Archivos | Criterio de aceptación |
|-------|----------|------------------------|
| C1. K-Anonymity endpoint | `backend/app/api/routes/exposure.py`, `frontend/src/lib/k-anonymity.ts` | Frontend hashea SHA-256, envía prefijo 5 chars, filtra localmente |
| C2. Dejar de guardar query en claro | `backend/app/models/consulted_scan.py` | Guardar solo hash parcial o eliminar PII de consultas |
| C3. Scraper ransomware (1 fuente) | `backend/app/services/scraping.py`, `backend/app/core/scheduler.py` | Job cada 15 min → Redis → endpoint dashboard |
| C4. Ingesta a PostgreSQL | `backend/app/models/incident.py`, seed dinámico | Nuevos scraps crean incidentes pendientes de review |

---

### Fase D — Inteligencia y alertas

| Tarea | Archivos | Criterio de aceptación |
|-------|----------|------------------------|
| D1. Integración OTX | `backend/app/services/osint_verify.py` | Campo `verificacion_externa` en respuesta threat |
| D2. Resumen ejecutivo | `backend/app/services/ai_rag.py` | Endpoint dedicado JSON `{ "resumen": "..." }` max 20 palabras |
| D3. Alertas Telegram | `backend/app/services/alerts.py` | Webhook configurable vía env; dispara en incidente Critical |
| D4. Expandir RAG | `backend/app/data/rag_cases/` | ≥20 casos reales con embeddings (sentence-transformers o OpenAI) |

---

### Fase E — Producción y tiempo real

| Tarea | Archivos | Criterio de aceptación |
|-------|----------|------------------------|
| E1. WebSockets feed | `backend/app/api/ws.py`, dashboard hook | Live log de nuevos incidentes sin refresh |
| E2. Tor pool | `backend/app/core/tor_pool.py` | Scrape .onion con rotación de circuitos |
| E3. Deploy | Vercel (frontend) + Cloud Run/Railway (backend) | Smoke tests post-deploy |
| E4. Actualizar Cursor rules | `.cursor/rules/leakguard-core.mdc` | Reflejar nuevas rutas y convenciones |

---

## 5. Orden recomendado para el agente Cursor

1. **Fase B** (tests) — bajo riesgo, alto valor para hackathon demo estable.
2. **C1** (K-Anonymity) — diferenciador ético del pitch.
3. **C3** (1 scraper) — demuestra visión de recolección sin Tor complejo.
4. **D1 + D3** — verificación externa + alerta Telegram (impacto demo).
5. Resto según tiempo disponible.

---

## 6. Legacy v1

No expandir `legacy/` salvo hotfixes. Mantener solo como referencia y demo offline:

```bash
npm run dev:legacy   # → http://localhost:1337
```

Archivos: `legacy/app.js`, `legacy/proxy/server.js`, `legacy/functions/index.js`

---

## 7. Checklist al cerrar cada tarea

- [ ] Código implementado y probado localmente (`docker compose up` o dev local)
- [ ] SDD.md actualizado si cambia estado de módulo (✅ / ⚠️ / 🔜)
- [ ] CHANGELOG.md con entrada semver
- [ ] Cursor rules actualizadas si cambian convenciones
- [ ] Tests añadidos o actualizados (Fase B en adelante)

---

## 8. Referencias rápidas

| Recurso | Ubicación |
|---------|-----------|
| API Swagger | http://localhost:8000/docs |
| Frontend dev | http://localhost:3000 |
| Variables backend | `backend/.env.example` |
| Seed incidentes | `backend/app/data/seed.py` |
| Cliente REST frontend | `frontend/src/lib/api.ts` |
| Reglas agente | `.cursor/rules/*.mdc` |
