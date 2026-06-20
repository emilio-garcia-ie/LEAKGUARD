# SDD: LeakGuard

**Versión:** 3.0 (Stack v2 implementado)  
**Estado:** Alineado con el código en `frontend/` + `backend/`  
**Objetivo:** Plataforma de threat intelligence OSINT con proxy seguro y verificación humana.  
**Repositorio:** https://github.com/paltaunkwnow/LEAKGUARD

---

## Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 3.0 | 2026-06-20 | Equipo LeakGuard | Migración a Next.js 14 + FastAPI + PostgreSQL + Redis. SDD alineado con implementación. |
| 2.1 | 2026-06-20 | Equipo LeakGuard | Sección 9: Testing y Calidad de Código |
| 2.0 | 2026-06-20 | Equipo LeakGuard | Draft inicial con 8 módulos y stack objetivo |
| 1.0 | 2026-06-20 | Equipo LeakGuard | MVP v1 vanilla JS + Firebase (ahora en `legacy/`) |

Ver el historial completo en [CHANGELOG.md](CHANGELOG.md). El plan de alineación está completado: [SDD-plan.md](SDD-plan.md).

---

## 1. Introducción y Filosofía del Proyecto

### 1.1. El Problema
- Las filtraciones de datos aparecen en foros criminales, blogs de ransomware y marketplaces ocultos.
- La información está dispersa, es técnica y difícil de interpretar.
- Herramientas como VECERT scrapean datos robados de forma opaca, almacenan información sensible y operan en un limbo legal.

### 1.2. Nuestra Solución (El Diferencial)
- **Scraping Ético de Anuncios:** Rastreamos los *anuncios* y *metadatos* (título, víctima, fecha, tamaño, URL de origen), pero **NUNCA descargamos, almacenamos ni mostramos** credenciales, DNI, números de tarjeta o archivos filtrados (.sql, .csv, .zip).
- **Transparencia Radical:** Cada alerta muestra la URL exacta de la fuente criminal, una captura de pantalla (vía URLScan) y el texto literal del anuncio para que el usuario contraste.
- **Verificación OSINT:** Cruzamos la información con fuentes públicas (OTX, Ransomware.live) para dar un "Nivel de Confianza".
- **Privacidad en Búsquedas:** Usamos K-Anonymity (hash SHA-256) para que el servidor NUNCA sepa qué empresa está buscando el usuario.

---

## 2. Arquitectura General (v3.0 — implementada)

```
Browser (Next.js 14)
    ↓ REST + JWT
FastAPI Backend (/api/v1/*)
    ├── PostgreSQL → usuarios, incidentes, audit_logs, consulted_scans
    ├── Redis → cache de scraps, sesiones
    ├── leakosintapi.com (OSINT_TOKEN en servidor)
    ├── xposedornot.com (gratis, breach-check)
    ├── OpenAI GPT-4o-mini (opcional)
    └── FAISS RAG local (fallback offline)
```

**Flujo Exposure Check:**
1. Frontend envía `{ request, mode }` a `POST /api/v1/exposure/scan`.
2. Backend consulta LeakOsint con token en `.env` (nunca en browser).
3. Si es email, merge con XposedOrNot.
4. Backend censura credenciales, calcula riesgo y recomendaciones.
5. Guarda consulta en PostgreSQL (`consulted_scans`).

**Legacy v1:** SPA vanilla + Express/Firebase en `legacy/`.

---

## 3. Módulos Detallados

### Módulo 1: Recolección de Inteligencia (El Scraper Transparente)
**Fuentes rastreadas:**
- Blogs de ransomware públicos (ej: LockBit, BlackCat/ALPHV).
- Foros criminales accesibles sin autenticación (ej: secciones públicas de XSS, BreachForums).
- Marketplaces de datos (solo títulos de listados).

**¿Qué extraemos?**
- titulo: Texto completo del anuncio.
- actor: Grupo criminal (ej: LockBit).
- victima: Nombre de la empresa/entidad.
- fecha: Fecha de publicación.
- tamano: Volumen de datos en GB/MB.
- url_fuente: Enlace directo al post original.
- snippet: Extracto de las primeras 500 palabras.

**¿Qué NO hacemos?**
- No descargamos archivos adjuntos.
- No seguimos enlaces a mega.nz / dropbox / onion.
- No almacenamos credenciales ni PII.

**Mecanismo de Rapidez:**
- Pool de Tor: 5 circuitos rotatorios para evitar bloqueos en .onion.
- Paralelismo: Playwright con headless=True y bloqueo de imágenes/CSS. Lanzamos 4 scrapeos en paralelo (asyncio).
- Cron job: Ejecutamos el scraper cada 15 minutos. Los datos van directo a Redis (no a PostgreSQL) para lectura instantánea.

**Ejemplo de salida (JSON guardado en Redis):**
{
  "id": "lk_20260620_001",
  "actor": "LockBit",
  "victima": "ACME Corp",
  "fecha": "2026-06-20T10:05:00Z",
  "sector": "Finanzas",
  "pais": "España",
  "tamano_gb": 120,
  "url_fuente": "http://lockbit7...onion/posts/acme.html",
  "snippet": "Hemos exfiltrado 120 GB de SQL y documentación interna...",
  "timestamp_deteccion": "2026-06-20T10:07:00Z"
}

---

### Módulo 2: Clasificación y Verificación con IA
**Función:** La IA lee el snippet y el titulo, y responde preguntas clave.

**Transparencia activa:** La IA también verifica si la info coincide con feeds OSINT públicos (AlienVault OTX, Ransomware.live). Si coinciden, sube el nivel de confianza.

**Salida enriquecida (Se guarda en PostgreSQL para histórico):**
{
  "criticidad": "Alta",
  "score": 87,
  "verificacion_externa": "Confirmado por OTX Pulse #8832 y Ransomware.live",
  "discrepancia": "El grupo dice 120GB, OSINT reporta 90GB (mostramos ambos)",
  "razon_ia": "Contiene credenciales y datos personales según el anuncio.",
  "categoria_datos": ["Credenciales", "Datos Personales", "Internos"],
  "confianza_fuente": 0.92
}

---

### Módulo 3: Motor de Riesgo Explicable (Threat Score)
**Filosofía:** No queremos una "caja negra". El score debe ser matemáticamente trazable.

**Variables (Estandarizadas):**
- has_credentials (30 pts)
- has_financial (25 pts)
- has_pii (20 pts)
- size > 50GB (15 pts)
- es_ransomware_conocido (10 pts)

**Cálculo en tiempo real:** Se ejecuta en el backend en < 2ms (pura aritmética).

**Ejemplo de output visible en UI:**
"+30 (Credenciales) + 25 (Financiero) + 20 (PII) = 75/100. Riesgo Alto."

---

### Módulo 4: Resumen Ejecutivo (Traducción a Negocio)
**Problema:** El snippet técnico no es útil para un CEO o CISO en una reunión.

**Solución:** Usamos OpenAI (modelo gpt-4o-mini) con un prompt estricto que devuelve JSON en < 1s.

**Prompt:**
"Traduce este texto técnico a lenguaje de negocio. Máximo 20 palabras. Responde en JSON: {"resumen": "..."}"

**Ejemplo:**
- Entrada: "Hemos exfiltrado 120 GB de SQL..."
- Salida: "La organización podría haber sufrido exposición de bases de datos internas con información crítica. Revisar accesos y cumplimiento normativo."

**Cache Semántico:** Si un actor (LockBit) ataca a una empresa del mismo sector (Finanzas) con tamaño similar, devolvemos el resumen cacheado sin llamar a OpenAI.

---

### Módulo 5: Dashboard en Tiempo Real
**Tecnología:** Next.js + Tailwind CSS + shadcn/ui.  
**Actualización:** WebSockets (o Server-Sent Events) para mostrar el "live log" del scraping cada 15 minutos.

**Widgets visibles:**
1. Tarjetas KPI: Filtraciones hoy, Empresas afectadas, Grupos activos, Países más atacados.
2. Mapa Mundial: Leaflet con geolocalización de incidentes.
3. Timeline: (10:05 - Detectado, 10:08 - Analizado IA, 10:10 - Riesgo Calculado).
4. Panel de Transparencia: Badge fijo que dice "Última actualización: Hace 3 min | Fuentes: 4 foros + 2 blogs criminales".

---

### Módulo 6: Búsqueda de Exposición (K-Anonymity)
**El problema de privacidad:** Si guardo el dominio "acme.com" en mi BD, tengo un registro de lo que buscan mis usuarios (GDPR).

**La solución (HIBP Style):**
1. El frontend hashea el dominio en SHA-256: hash = sha256("acme.com") -> a94a8fe5cc...
2. Toma los primeros 5 caracteres: a94a8.
3. Envía GET /api/breaches?prefix=a94a8.
4. El backend devuelve TODOS los hashes completos que empiezan por a94a8 (que están en la BD de leaks).
5. El frontend (JavaScript) filtra localmente el hash completo para ver si coincide.

**Resultado:** El servidor nunca sabe qué empresa está buscando. Es 100% anónimo y ético. Además, como devolvemos solo un array de hashes (strings cortos), la respuesta es < 50 ms.

**Visualización del resultado:**
- Si hay match: "Se encontraron 3 incidentes relacionados".
- Muestra: Actor, Fecha, y un botón "Ver Anuncio Original" (redirige a la URL criminal).
- Aviso Legal visible: "No mostramos datos filtrados. Solo metadatos del anuncio público. Consulte la fuente para verificar."

---

### Módulo 7: Alertas Inteligentes (Push)
**Disparador:** Cuando un nuevo incidente se guarda en PostgreSQL con criticidad = Alta.

**Canales:**
- Email: Con resumen ejecutivo y enlace al dashboard.
- Telegram / Discord / Slack: Mensaje corto con el nombre de la víctima y el score.

**Ejemplo de mensaje (Telegram):**
🚨 Nueva filtración crítica detectada!
Empresa: ACME Corp
Actor: LockBit
Riesgo: 87/100 (Alto)
Fuente: [Enlace al anuncio]
Acción recomendada: Revisar accesos urgentemente.

---

### Módulo 8: Copiloto de Ciberseguridad (Chat RAG)
**Tecnología:** FastAPI + Vectorstore (FAISS o ChromaDB) cargado en memoria.

**Estrategia para Hackathon (Sin depender de Internet):**
1. Pre-cargamos 50 casos de estudio de ransomware famosos (públicos, como Colonial Pipeline, SolarWinds) en vectores.
2. Cuando el usuario pregunta, buscamos el caso más similar y generamos la respuesta con un template.

**Ejemplo de interacción:**
- Usuario: "¿Por qué esta filtración es crítica?"
- IA: "Porque según el anuncio, contiene credenciales de administradores. Esto podría facilitar un ataque de movimientos laterales similar al incidente de [CASO VECINO]."
- Usuario: "¿Qué hago?"
- IA: "Rotación inmediata de contraseñas, revisión de MFA, y auditoría de logs."

---

## 4. Stack Tecnológico (Implementado v3.0)

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui | ✅ |
| Backend | Python 3.11 + FastAPI (async) | ✅ |
| Base de Datos | PostgreSQL | ✅ |
| Cache | Redis | ✅ |
| Scraping | Playwright + BeautifulSoup + aiohttp | ✅ (endpoint) |
| IA | OpenAI GPT-4o-mini + FAISS | ✅ (fallback offline) |
| Visualización | Chart.js + Leaflet | ✅ |

**Roadmap:** Tor pool, K-Anonymity, WebSockets, alertas push.

---

## 5. Estructura de Carpetas (v3.0)

```
/leakguard
├── /frontend                 # Next.js 14 App Router
│   ├── /src/app              # landing, login, dashboard, exposure, admin, ai-safety
│   ├── /src/components       # shadcn/ui, charts, layout
│   └── /src/lib/api.ts       # Cliente REST
├── /backend
│   ├── /app
│   │   ├── /api/routes       # auth, threats, exposure, dashboard, ai
│   │   ├── /core             # config, database, redis, security
│   │   ├── /models           # SQLAlchemy
│   │   ├── /services         # osint, breach, censor, exposure, scraping, ai_rag
│   │   └── main.py
│   └── requirements.txt
├── /legacy                   # v1: index.html, app.js, proxy/, functions/
├── docker-compose.yml
├── SDD.md
├── CHANGELOG.md
└── README.md
```

---

## 6. Plan de Desarrollo (48h Hackathon)

- Hora 0-4: Configurar proyecto Next.js + FastAPI + Docker Compose (Redis/Postgres).
- Hora 4-10: Desarrollar scraper básico (Playwright) que guarde en Redis. Probar con 1 blog de ransomware.
- Hora 10-14: Implementar endpoint de búsqueda con K-Anonymity y lógica de Risk Score.
- Hora 14-20: Integrar OpenAI para resúmenes y montar el dashboard básico (tarjetas).
- Hora 20-28: Añadir sistema de alertas (Telegram/Slack) y el Copilot (RAG con casos locales).
- Hora 28-38: Pulir UI/UX, añadir transparencia (botones "Ver Fuente", badges de confianza).
- Hora 38-44: Testear y arreglar bugs críticos.
- Hora 44-48: Preparar pitch, grabar demo en video (por si falla internet) y desplegar en Vercel/Railway.

---

## 9. Testing y Calidad de Código

### 9.1. Unit Tests (objetivo v3.0)
- **Backend (FastAPI):** `pytest` para:
  - `services/exposure.py` — `calculate_real_risk_percent()`, `parse_osint_response()`
  - `services/censor.py` — censura de passwords, emails, hashes
  - `api/routes/exposure.py` — validación de inputs, errores 503 sin token
- **Frontend (Next.js):** Vitest para `lib/api.ts` y utilidades puras.
- **Legacy (v1):** Tests Jest para funciones en `legacy/app.js` (referencia).

### 9.2. Smoke Tests
- `GET /health` → 200
- `GET /api/v1/threats` → lista de incidentes
- Frontend carga `/dashboard` sin error 5xx
- `POST /api/v1/exposure/scan` responde (503 si falta OSINT_TOKEN)

### 9.3. Estrategia del Agente de Código
- Todo PR debe incluir tests para lógica nueva en backend.
- Cobertura mínima objetivo: 70% backend, 50% frontend.
- No commitear `OSINT_TOKEN` ni `backend/.env`.

---

## 10. Pitch Final (30 segundos)

"Mientras que herramientas opacas comercializan datos filtrados en secreto, **LeakGuard** es transparente y seguro. Consultamos índices OSINT con proxy backend — el token nunca llega al navegador —, censuramos credenciales, calculamos riesgo explicable y permitimos verificación humana con audit trail en PostgreSQL. Nuestra IA (GPT-4o-mini + FAISS) traduce incidentes a recomendaciones accionables. De filtraciones dispersas a inteligencia verificada en segundos."

---

## 11. Descargo de Responsabilidad Legal (Para incluir en el Footer)

"LeakGuard indexa metadatos de filtraciones públicas vía APIs OSINT. No almacenamos ni mostramos credenciales en texto claro — solo representaciones censuradas. La información se proporciona con fines de concienciación y seguridad. Verifique la autenticidad de las fuentes directamente."