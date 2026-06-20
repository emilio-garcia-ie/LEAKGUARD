"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, AiSafetyMetrics } from "@/lib/api";

export default function AiSafetyPage() {
  const [metrics, setMetrics] = useState<AiSafetyMetrics | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.aiSafety().then(setMetrics);
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.aiAnalyze(
        "Incidente LockBit 3.0 contra sector salud con exfiltración AD y hashes NTLM.",
        "Resume riesgo e impacto para el analista."
      );
      setAnalysis(res.answer);
    } catch (err) {
      setAnalysis(err instanceof Error ? err.message : "Error en análisis AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-6">AI Safety & RAG Pipeline</h1>

        {metrics && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-cyan-400">{metrics.verificationRate}%</div><div className="text-sm text-slate-500">Tasa verificación</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-orange-400">{metrics.falsePositiveRate}%</div><div className="text-sm text-slate-500">Falsos positivos</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-3xl font-bold text-purple-400">{metrics.avgConfidence}%</div><div className="text-sm text-slate-500">Confianza media</div></CardContent></Card>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Análisis GPT-4o-mini + FAISS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              RAG local con FAISS para contexto offline. Si OPENAI_API_KEY no está configurada, responde en modo offline.
            </p>
            <Button onClick={runAnalysis} disabled={loading}>{loading ? "Analizando..." : "Ejecutar análisis de muestra"}</Button>
            {analysis && <pre className="bg-slate-900 p-4 rounded text-sm text-slate-300 whitespace-pre-wrap">{analysis}</pre>}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
