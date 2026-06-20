# Changelog

All notable changes to the SDD.md document will be documented in this file.

## [Unreleased]

### Planned
- Align SDD with actual implemented architecture (Firebase + vanilla JS + OSINT APIs)
- Replace non-implemented modules with roadmap entries
- Add version history section inside SDD.md

---

## [1.0.0] - 2026-06-20

### Added
- Initial SDD for LeakGuard (formerly "LeakWatch AI")
- 8 modules: scraping, AI classification, risk engine, executive summary, dashboard, K-anonymity search, alerts, RAG copilot
- Tech stack: FastAPI, Next.js, Playwright, Tor, Redis, PostgreSQL, OpenAI, FAISS
- 48h hackathon development plan
- Final pitch and legal disclaimer

### Notes
- This version describes an ambitious architecture that was not fully implemented.
- The actual codebase uses a different stack (Firebase, vanilla JS, external OSINT APIs).
- See [SDD-plan.md](SDD-plan.md) for the plan to align the SDD with reality.
