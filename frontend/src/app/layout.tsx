import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeakGuard — Threat Intelligence",
  description: "Plataforma OSINT de verificación de filtraciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
