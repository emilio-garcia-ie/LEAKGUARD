import Link from "next/link";
import { Shield, Radar, Lock, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl">
          <Shield className="w-7 h-7" /> LeakGuard
        </div>
        <Link href="/login"><Button>Ingresar</Button></Link>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Threat Intelligence & OSINT
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Next.js 14 + FastAPI + PostgreSQL + Redis. Escaneo de filtraciones con credenciales censuradas, RAG con OpenAI y FAISS, y scraping Playwright.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login"><Button size="lg">Acceder al Dashboard</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline">Modo Demo</Button></Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {[
          { icon: Radar, title: "Exposure Check", desc: "Dominio, email y teléfono con proxy seguro OSINT + XposedOrNot." },
          { icon: Lock, title: "Credenciales censuradas", desc: "Contraseñas parcialmente ocultas y % de riesgo calculado." },
          { icon: Brain, title: "AI Safety + RAG", desc: "GPT-4o-mini con índice FAISS local para análisis offline." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-6 rounded-xl border border-slate-800 bg-slate-950/60">
            <Icon className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
