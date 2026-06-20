<p align="center">
  <img src="https://img.shields.io/badge/LeakGuard-v2-22d3ee?style=for-the-badge&labelColor=0f172a" alt="LeakGuard" />
</p>

<h1 align="center">LeakGuard v2</h1>

<p align="center">
  Plataforma de <strong>Threat Intelligence</strong> y verificación OSINT — stack moderno preparado para Cursor.
</p>

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | Python 3.11 + FastAPI (async) |
| **Base de datos** | PostgreSQL (usuarios, incidentes, auditoría, consultas) |
| **Cache** | Redis (scraps, sesiones) |
| **Scraping** | Playwright + BeautifulSoup + aiohttp |
| **IA** | OpenAI GPT-4o-mini + FAISS (RAG local offline) |
| **Visualización** | Chart.js + Leaflet |

---

## Inicio rápido

### Infraestructura

```powershell
docker compose up postgres redis -d
```

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- UI: http://localhost:3000
- API docs: http://localhost:8000/docs

### Docker completo

```powershell
docker compose up --build
```

---

## Configuración

| Variable | Descripción |
|----------|-------------|
| `OSINT_TOKEN` | Token LeakOsint (solo backend) |
| `OPENAI_API_KEY` | GPT-4o-mini (opcional) |
| `DATABASE_URL` | PostgreSQL |
| `REDIS_URL` | Redis |

---

## Legacy v1

App vanilla en `legacy/`. Ejecutar: `npm run dev:legacy` → http://localhost:1337
