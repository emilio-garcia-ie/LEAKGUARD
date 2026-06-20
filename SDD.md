# SDD: LeakWatch AI (Nombre provisional)
## (Alternativas: ThreatLens, BreachRadar, DarkIntel)

**Versión:** 2.0 (Ético + Transparente + Ultrarrápido)  
**Estado:** Draft inicial — no refleja la arquitectura implementada  
**Objetivo:** Hackathon / MVP funcional en 48 horas.  
**Contexto:** Herramienta que monitoriza filtraciones de fuentes públicas (incluyendo entornos criminales) pero con un enfoque radical en transparencia, velocidad y privacidad.

---

## Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 2.0 | 2026-06-20 | Equipo LeakGuard | Draft inicial con 8 módulos, stack FastAPI/Next.js/Playwright/Tor/Redis/PostgreSQL/OpenAI |

> **Nota:** La versión actual describe una arquitectura ambiciosa que no se implementó tal cual. El código real usa Firebase + vanilla JS + APIs OSINT externas. Ver [SDD-plan.md](SDD-plan.md) para el plan de alineación.

Ver el historial completo de cambios en [CHANGELOG.md](CHANGELOG.md).

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

## 2. Arquitectura General

[Diagrama de flujo en texto plano]
Flujo principal:
1. Scrapers Asíncronos (Playwright + Tor Pool) -> extraen metadatos + URL.
2. Guardan en Redis Cache (TTL: 1 hora).
3. FastAPI Backend lee de Redis y también escribe en PostgreSQL (histórico).
4. Backend consulta a OpenAI / RAG Local para resúmenes y copiloto.
5. Frontend Next.js se comunica con Backend vía REST/WS.
6. Usuario busca dominio -> Frontend hashea (SHA-256) -> envía prefijo (K-Anonymity) -> Backend devuelve hashes coincidentes -> Frontend filtra localmente.
7. Fuentes OSINT (OTX, Ransomware.live) son consultadas por el Backend para verificación externa.

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

## 4. Stack Tecnológico (Preparado para Cursor)

- Frontend: Next.js 14 (App Router), Tailwind CSS, shadcn/ui.
- Backend: Python 3.11 + FastAPI (alta velocidad, async nativo).
- Base de Datos: PostgreSQL (para histórico de incidentes y usuarios).
- Cache/Memoria: Redis (para almacenar los últimos scraps y sesiones).
- Scraping: Playwright (para sitios con JS) + BeautifulSoup (para estáticos) + aiohttp.
- Inteligencia Artificial: OpenAI API (GPT-4o-mini) + FAISS (para RAG local offline).
- Visualización: Chart.js (gráficos) y Leaflet (mapas).

---

## 5. Estructura de Carpetas (Sugerida para Cursor)

/leakwatch-ai
├── /backend
│   ├── /app
│   │   ├── /api         (Endpoints: /scrape, /search, /alerts, /copilot)
│   │   ├── /core        (Scrapers, TorPool, Redis client)
│   │   ├── /models      (SQLAlchemy or Pydantic models)
│   │   ├── /services    (AI service, Risk engine)
│   │   └── main.py      (FastAPI entrypoint)
│   ├── /data            (Casos pre-cargados para RAG)
│   ├── requirements.txt
│   └── Dockerfile
├── /frontend
│   ├── /app
│   │   ├── /dashboard   (Page)
│   │   ├── /search      (Page)
│   │   ├── /components  (UI components)
│   │   └── /lib         (Utils, K-Anonymity hasher)
│   ├── package.json
│   └── next.config.js
├── /docker-compose.yml  (PostgreSQL + Redis + Backend + Frontend)
└── README.md

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

## 7. Pitch Final (30 segundos)

"Mientras que herramientas como VECERT roban datos filtrados y los venden en secreto, LeakWatch AI es completamente transparente. Rastreamos los anuncios públicos de grupos de ransomware y foros criminales, pero nunca almacenamos ni mostramos credenciales o datos personales. Cada alerta muestra la URL exacta de la fuente original y un nivel de confianza verificado con OSINT. Nuestra IA traduce el caos técnico a un resumen ejecutivo accionable y nuestro buscador es 100% anónimo gracias a hash parcial. Pasamos de 'información oscura' a 'inteligencia verificada y ética en menos de 3 segundos'."

---

## 8. Descargo de Responsabilidad Legal (Para incluir en el Footer)

"LeakWatch AI solo indexa metadatos de anuncios públicos disponibles en internet. No facilitamos el acceso a datos filtrados, ni almacenamos información personal. Toda la información mostrada es de dominio público y se proporciona únicamente con fines de concienciación y seguridad. Recomendamos a los usuarios verificar la autenticidad de las fuentes directamente."