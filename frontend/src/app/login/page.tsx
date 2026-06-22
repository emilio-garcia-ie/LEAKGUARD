"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, LANG_META, Lang } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, register, demo, user, loading } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const breachAlert =
        tab === "login" ? await login(email, password) : await register(email, password, name || "Analyst");
      if (breachAlert) setAlert(breachAlert.message);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth_error);
    }
  };

  const handleDemo = async () => {
    await demo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Language switcher - top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="text-base">{LANG_META[lang].flag}</span>
            <span className="hidden sm:inline">{LANG_META[lang].label}</span>
            <span className={cn("text-xs transition-transform duration-200 inline-block", langOpen && "rotate-180")}>▾</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/40 overflow-hidden z-50">
              {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                    lang === code ? "bg-cyan-950/60 text-cyan-400 font-semibold" : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <span className="text-base">{info.flag}</span>
                  <span>{info.label}</span>
                  {lang === code && <span className="ml-auto text-cyan-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-cyan-400"><Shield className="w-8 h-8" /></div>
          <CardTitle>{t.login_title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={tab === "login" ? "default" : "outline"} className="flex-1" onClick={() => setTab("login")}>{t.login_tab}</Button>
            <Button variant={tab === "register" ? "default" : "outline"} className="flex-1" onClick={() => setTab("register")}>{t.register_tab}</Button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {tab === "register" && (
              <Input placeholder={t.name_placeholder} value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input type="email" placeholder={t.email_placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t.password_placeholder} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {alert && <p className="text-yellow-400 text-sm">{alert}</p>}
            <Button type="submit" className="w-full">{tab === "login" ? t.login_btn : t.register_btn}</Button>
          </form>
          <Button variant="outline" className="w-full mt-3" onClick={handleDemo}>{t.demo_btn}</Button>
          <Link href="/" className="block text-center text-sm text-slate-500 mt-4 hover:text-cyan-400">{t.back_home}</Link>
        </CardContent>
      </Card>
    </div>
  );
}
