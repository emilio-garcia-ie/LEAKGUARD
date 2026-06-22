"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut, ChevronDown, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const nav = [
    { href: "/dashboard", label: t.nav_dashboard, dot: "bg-cyan-400" },
    { href: "/exposure", label: t.nav_exposure, dot: "bg-purple-400" },
    { href: "/resources", label: t.nav_resources, dot: "bg-emerald-400" },
    { href: "/admin", label: t.nav_admin, dot: "bg-orange-400" },
    { href: "/ai-safety", label: t.nav_ai_safety, dot: "bg-violet-400" },
  ];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!user) return null;

  const meta = LANG_META[lang];

  return (
    <div className="min-h-screen bg-[#040B14] text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <header className="border-b border-white/5 bg-[#040B14]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-extrabold tracking-tight">
              LeakGuard
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    active
                      ? "bg-white/8 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  {active && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", item.dot)} />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Switcher */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium"
                aria-label="Change language"
              >
                <span className="text-sm leading-none">{meta.flag}</span>
                <span className="hidden sm:inline">{meta.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", langOpen && "rotate-180")} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0d1526] shadow-2xl shadow-black/60 overflow-hidden z-50">
                  {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors",
                        lang === code ? "bg-cyan-500/15 text-cyan-400 font-semibold" : "text-slate-300 hover:bg-white/5"
                      )}
                      dir={info.dir}
                    >
                      <span className="text-base">{info.flag}</span>
                      <span>{info.label}</span>
                      {lang === code && <CheckCircle className="ml-auto w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User info */}
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[10px] text-slate-500">{user.role}</div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              title={t.nav_logout}
              onClick={() => { logout(); router.push("/login"); }}
              className="text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">{children}</main>
    </div>
  );
}
