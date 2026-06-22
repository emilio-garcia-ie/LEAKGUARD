"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/contexts/language-context";

type ThreatMapItem = {
  id: string;
  date: string;
  actor: string;
  victim: string;
  sector: string;
  country: string;
  riskScore: number;
  status: string;
};

type Props = { threats: ThreatMapItem[]; countryFilter?: string };

const COORDS: Record<string, [number, number]> = {
  "United States": [39.8283, -98.5795],
  "United Kingdom": [55.3781, -3.436],
  Canada: [56.1304, -106.3468],
  Singapore: [1.3521, 103.8198],
  Germany: [51.1657, 10.4515],
  Australia: [-25.2744, 133.7751],
  Argentina: [-38.4161, -63.6167],
  Chile: [-35.6751, -71.543],
  Bolivia: [-16.2902, -63.5887],
  Brazil: [-14.235, -51.9253],
  Peru: [-9.19, -75.0152],
  Colombia: [4.5709, -74.2973],
  Mexico: [23.6345, -102.5528],
  Uruguay: [-32.5228, -55.7658],
  Paraguay: [-23.4425, -58.4438],
  Venezuela: [6.4238, -66.5897],
  Ecuador: [-1.8312, -78.1834],
};

const LATAM_BREACHES: ThreatMapItem[] = [
  { id: "latam-ar-1", date: "2025-11-14", actor: "IntelBroker", victim: "RENAPER Argentina", sector: "Gobierno", country: "Argentina", riskScore: 95, status: "Critical" },
  { id: "latam-ar-2", date: "2025-08-22", actor: "Desconocido", victim: "PAMI Argentina", sector: "Salud", country: "Argentina", riskScore: 88, status: "Critical" },
  { id: "latam-ar-3", date: "2024-12-10", actor: "Rhysida", victim: "Banco Nación Argentina", sector: "Finanzas", country: "Argentina", riskScore: 82, status: "High" },
  { id: "latam-cl-1", date: "2025-09-05", actor: "Medusa Locker", victim: "Poder Judicial Chile", sector: "Justicia", country: "Chile", riskScore: 91, status: "Critical" },
  { id: "latam-cl-2", date: "2025-05-18", actor: "LockBit 3.0", victim: "Carabineros de Chile", sector: "Seguridad", country: "Chile", riskScore: 87, status: "Critical" },
  { id: "latam-cl-3", date: "2024-11-02", actor: "Desconocido", victim: "Falabella Chile", sector: "Retail", country: "Chile", riskScore: 74, status: "High" },
  { id: "latam-bo-1", date: "2025-07-30", actor: "GhostSec", victim: "Aduana Nacional Bolivia", sector: "Gobierno", country: "Bolivia", riskScore: 79, status: "High" },
  { id: "latam-bo-2", date: "2025-03-14", actor: "Desconocido", victim: "SEGIP Bolivia", sector: "Identidad", country: "Bolivia", riskScore: 83, status: "High" },
  { id: "latam-br-1", date: "2025-10-19", actor: "N4aughtySec", victim: "Receita Federal Brasil", sector: "Gobierno", country: "Brazil", riskScore: 93, status: "Critical" },
  { id: "latam-co-1", date: "2025-06-11", actor: "RansomHub", victim: "Supersalud Colombia", sector: "Salud", country: "Colombia", riskScore: 85, status: "Critical" },
  { id: "latam-mx-1", date: "2025-08-03", actor: "Scattered Spider", victim: "SAT México", sector: "Finanzas", country: "Mexico", riskScore: 89, status: "Critical" },
  { id: "latam-pe-1", date: "2025-04-22", actor: "Desconocido", victim: "Banco de la Nación Perú", sector: "Finanzas", country: "Peru", riskScore: 76, status: "High" },
];

const STATUS_COLOR: Record<string, { color: string; fill: string }> = {
  Critical: { color: "#f43f5e", fill: "#e11d48" },
  High:     { color: "#fb923c", fill: "#ea580c" },
  Medium:   { color: "#facc15", fill: "#ca8a04" },
  Low:      { color: "#22d3ee", fill: "#0891b2" },
};

const STATUS_LABEL: Record<string, string> = {
  Critical: "CRITICAL",
  High:     "HIGH",
  Medium:   "MEDIUM",
  Low:      "LOW",
};

function getCenter(countryFilter?: string): { center: [number, number]; zoom: number } {
  if (countryFilter && COORDS[countryFilter]) {
    return { center: COORDS[countryFilter], zoom: 5 };
  }
  return { center: [-18, -65], zoom: 3 };
}

function MapInner({ threats, countryFilter }: Props) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MC, setMC] = useState<Record<string, React.ComponentType<any>> | null>(null);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("react-leaflet").then((mod: any) => setMC(mod));
  }, []);

  if (!mounted || !MC) {
    return <div className="h-80 bg-slate-900 rounded-lg animate-pulse flex items-center justify-center text-slate-600 text-sm">Loading map…</div>;
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = MC;

  const apiIds = new Set(threats.map((item) => item.id));
  const combined: ThreatMapItem[] = [
    ...threats,
    ...LATAM_BREACHES.filter((b) => !apiIds.has(b.id)),
  ];

  // When country filter is active, only show that country on map
  const visible = countryFilter
    ? combined.filter((item) => item.country === countryFilter)
    : combined;

  const { center, zoom } = getCenter(countryFilter);

  return (
    <MapContainer
      key={countryFilter || "all"} // remount on filter change to update center
      center={center}
      zoom={zoom}
      className="h-80 w-full rounded-lg z-0"
      style={{ background: "#0f172a" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      {visible.map((item, idx) => {
        const base = COORDS[item.country];
        if (!base) return null;
        const latJ = Math.sin(idx * 1.5) * 1.0;
        const lngJ = Math.cos(idx * 1.5) * 1.0;
        const pos: [number, number] = [base[0] + latJ, base[1] + lngJ];
        const col = STATUS_COLOR[item.status] ?? STATUS_COLOR.Low;
        const radius = item.status === "Critical" ? 11 : item.status === "High" ? 8 : 6;

        return (
          <CircleMarker
            key={item.id || idx}
            center={pos}
            radius={radius}
            pathOptions={{ color: col.color, fillColor: col.fill, fillOpacity: 0.75, weight: 2 }}
          >
            <Popup>
              <div style={{ minWidth: 190, fontFamily: "sans-serif", background: "#0f172a", color: "#e2e8f0", borderRadius: 10, padding: 4 }}>
                <div style={{ fontWeight: 700, color: "#22d3ee", borderBottom: "1px solid #1e293b", paddingBottom: 6, marginBottom: 8, fontSize: 13 }}>
                  {item.actor}
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.9 }}>
                  <div><span style={{ color: "#94a3b8" }}>{t.map_victim}:</span> <strong style={{ color: "#fff" }}>{item.victim}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>{t.col_country}:</span> {item.country}</div>
                  <div><span style={{ color: "#94a3b8" }}>{t.col_sector}:</span> {item.sector}</div>
                  <div><span style={{ color: "#94a3b8" }}>{t.map_date}:</span> <span style={{ fontFamily: "monospace", color: "#cbd5e1" }}>{item.date}</span></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 6, borderTop: "1px solid #1e293b", fontSize: 10 }}>
                  <span style={{ background: "#1e293b", color: "#94a3b8", padding: "2px 7px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700 }}>
                    {t.map_risk}: {item.riskScore}
                  </span>
                  <span style={{ fontWeight: 700, color: col.color }}>
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export const ThreatMap = dynamic(() => Promise.resolve(MapInner), { ssr: false });
