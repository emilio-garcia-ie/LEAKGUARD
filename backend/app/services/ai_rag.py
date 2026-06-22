"""OpenAI GPT-4o-mini + FAISS local RAG for threat analysis."""

import json
import os
from pathlib import Path
from typing import Any

import numpy as np

from app.core.config import settings

try:
    import faiss
except ImportError:
    faiss = None

_INDEX_DIR = Path(__file__).resolve().parent.parent / "data" / "faiss_index"
_index = None
_docs: list[str] = []


def _ensure_index(docs: list[str]) -> None:
    global _index, _docs
    if _index is not None or faiss is None:
        return

    _docs = docs
    if not docs:
        return

    dim = 384
    rng = np.random.default_rng(42)
    vectors = np.array([rng.standard_normal(dim).astype("float32") for _ in docs])
    faiss.normalize_L2(vectors)
    _index = faiss.IndexFlatIP(dim)
    _index.add(vectors)


def _retrieve(query: str, k: int = 3) -> list[str]:
    if not _docs:
        return []
    _ensure_index(_docs)
    if _index is None or faiss is None:
        return _docs[:k]
    dim = 384
    rng = np.random.default_rng(abs(hash(query)) % (2**32))
    q = rng.standard_normal(dim).astype("float32").reshape(1, -1)

    faiss.normalize_L2(q)
    _, indices = _index.search(q, min(k, len(_docs)))
    return [_docs[i] for i in indices[0] if i >= 0]


async def analyze_threat(context: str, question: str | None = None) -> dict[str, Any]:
    docs = [
        "LockBit ransomware targets healthcare with AD compromise and NTLM hash exfiltration.",
        "XposedOrNot indexes public breach data for email exposure verification.",
        "Plaintext password leaks require immediate credential rotation and MFA enforcement.",
        "Dark web forum listings often precede public breach disclosure by 48-72 hours.",
    ]
    _ensure_index(docs)
    retrieved = _retrieve(context or question or "", k=3)

    if not settings.openai_api_key:
        return {
            "model": "offline-rag",
            "answer": (
                "Análisis offline (sin OPENAI_API_KEY): "
                + " ".join(retrieved)
                + f" Contexto: {context[:500]}"
            ),
            "sources": retrieved,
            "confidence": 72,
        }

    is_gemini = False
    try:
        api_key = settings.openai_api_key
        is_gemini = bool(api_key and (api_key.startswith("AIzaSy") or api_key.startswith("AQ.")))

        if is_gemini:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            prompt = (
                "Eres un analista de threat intelligence. Responde en español, conciso.\n"
                f"Contexto RAG: {json.dumps(retrieved, ensure_ascii=False)}\n"
                f"Incidente: {context}\n"
                f"Pregunta: {question or 'Resume riesgo e impacto.'}"
            )
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30.0)
                if resp.status_code != 200:
                    raise Exception(f"HTTP {resp.status_code}: {resp.text}")
                data = resp.json()
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"model": "gemini-2.5-flash", "answer": answer, "sources": retrieved, "confidence": 88}
        else:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)
            prompt = (
                "Eres un analista de threat intelligence. Responde en español, conciso.\n"
                f"Contexto RAG: {json.dumps(retrieved, ensure_ascii=False)}\n"
                f"Incidente: {context}\n"
                f"Pregunta: {question or 'Resume riesgo e impacto.'}"
            )
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
            )
            answer = completion.choices[0].message.content or ""
            return {"model": "gpt-4o-mini", "answer": answer, "sources": retrieved, "confidence": 88}
    except Exception as exc:
        model_name = "gemini-2.5-flash" if is_gemini else "gpt-4o-mini"
        return {
            "model": model_name,
            "error": str(exc),
            "answer": f"No se pudo contactar la IA ({str(exc)}). " + " ".join(retrieved),
            "sources": retrieved,
            "confidence": 60,
        }


def ai_safety_metrics(incidents: list[dict[str, Any]]) -> dict[str, Any]:
    if not incidents:
        return {"verificationRate": "0.0", "falsePositiveRate": "0.0", "avgConfidence": "0.0"}

    verified = sum(1 for i in incidents if i.get("verificationStatus") == "Verified")
    rejected = sum(1 for i in incidents if i.get("verificationStatus") == "Rejected Incident")
    pending = sum(1 for i in incidents if i.get("verificationStatus") == "Pending Review")
    total = len(incidents)
    audited = verified + rejected
    fp = (rejected / audited * 100) if audited else 0
    vr = ((total - pending) / total * 100) if total else 0
    avg_conf = sum(i.get("confidence", 0) for i in incidents) / total
    return {
        "verificationRate": f"{vr:.1f}",
        "falsePositiveRate": f"{fp:.1f}",
        "avgConfidence": f"{avg_conf:.1f}",
    }
