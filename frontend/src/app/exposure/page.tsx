"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { api, ScanResult } from "@/lib/api";
import { useLang } from "@/contexts/language-context";

type Mode = "domain" | "email" | "phone";

export default function ExposurePage() {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("domain");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.scan(query.trim(), mode);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.scan_btn);
    } finally {
      setLoading(false);
    }
  };

  const placeholders: Record<Mode, string> = {
    domain: t.ph_domain,
    email: t.ph_email,
    phone: t.ph_phone,
  };

  const modeLabels: Record<Mode, string> = {
    domain: t.mode_domain,
    email: t.mode_email,
    phone: t.mode_phone,
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold mb-2">{t.exposure_title}</h1>
        <p className="text-slate-400 text-sm mb-6">{t.exposure_subtitle}</p>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(["domain", "email", "phone"] as Mode[]).map((m) => (
                <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => setMode(m)}>
                  {modeLabels[m]}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder={placeholders[mode]} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runScan()} />
              <Button onClick={runScan} disabled={loading}>{loading ? t.scanning_btn : t.scan_btn}</Button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <>
            <div className="grid md:grid-cols-4 gap-3 mb-6">
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-cyan-400">{result.risk.score}%</div><div className="text-xs text-slate-500">{t.risk_label} {result.risk.level}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.apiTotalResults ?? result.stats.totalLogins}</div><div className="text-xs text-slate-500">{t.indexed_logins}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{result.stats.databasesWithHits}</div><div className="text-xs text-slate-500">{t.db_hits}</div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{result.stats.plaintextPasswords}</div><div className="text-xs text-slate-500">{t.plaintext_pwd}</div></CardContent></Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {result.recommendations.map((rec) => (
                <Card key={rec.priority}>
                  <CardHeader><CardTitle className="text-base">{rec.priority}</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-400 space-y-1">
                    {rec.items.map((item, i) => <p key={i}>• {item}</p>)}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="overflow-x-auto">
              <CardHeader><CardTitle>{t.records_label} ({result.records.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm table-fixed">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left w-[110px]">{t.col_date}</th>
                      <th className="px-4 py-3 text-left w-[180px]">{t.col_source}</th>
                      <th className="px-4 py-3 text-left">{t.col_login}</th>
                      <th className="px-4 py-3 text-left w-[180px]">{t.col_credential}</th>
                      <th className="px-4 py-3 text-left w-[100px]">{t.col_severity}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.map((r, i) => (
                      <tr key={i} className="border-b border-slate-800/40">
                        <td className="px-4 py-2 font-mono text-slate-400 text-xs whitespace-nowrap">{String(r.date)}</td>
                        <td className="px-4 py-2 truncate text-slate-300" title={String(r.sourceName || r.title)}>{String(r.sourceName || r.title)}</td>
                        <td className="px-4 py-2 font-mono text-cyan-300 truncate" title={String(r.login)}>{String(r.login)}</td>
                        <td className="px-4 py-2 font-mono text-red-400 truncate" title={String(r.credential)}>{String(r.credential)}</td>
                        <td className="px-4 py-2"><Badge className={statusBadge(String(r.severity))}>{String(r.severity)}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
