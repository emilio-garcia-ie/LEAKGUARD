"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

type Props = { threats: ThreatMapItem[] };

const coords: Record<string, [number, number]> = {
  "United States": [39.8283, -98.5795],
  "United Kingdom": [55.3781, -3.436],
  Canada: [56.1304, -106.3468],
  Singapore: [1.3521, 103.8198],
  Germany: [51.1657, 10.4515],
  Australia: [-25.2744, 133.7751],
};

const getMarkerOptions = (status: string) => {
  switch (status) {
    case "Critical":
      return { color: "#f43f5e", fillColor: "#e11d48" }; // Rose/Red
    case "High":
      return { color: "#fb923c", fillColor: "#ea580c" }; // Orange
    case "Medium":
      return { color: "#facc15", fillColor: "#ca8a04" }; // Yellow
    default:
      return { color: "#22d3ee", fillColor: "#0891b2" }; // Cyan
  }
};

function MapInner({ threats }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-64 bg-slate-900 rounded-lg animate-pulse" />;

  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
  const L = require("leaflet");
  const { MapContainer, TileLayer, CircleMarker, Popup } = require("react-leaflet");
  require("leaflet/dist/leaflet.css");
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */

  return (
    <MapContainer center={[20, 0]} zoom={2} className="h-64 w-full rounded-lg z-0">
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap" />
      {threats.map((t, idx) => {
        const baseCoords = coords[t.country];
        if (!baseCoords) return null;

        // Deterministic jitter to prevent exact overlapping markers
        const latJitter = Math.sin(idx * 1.5) * 1.8;
        const lngJitter = Math.cos(idx * 1.5) * 1.8;
        const pos: [number, number] = [baseCoords[0] + latJitter, baseCoords[1] + lngJitter];

        const options = getMarkerOptions(t.status);

        return (
          <CircleMarker
            key={t.id || idx}
            center={pos}
            radius={6 + (t.riskScore / 10)}
            pathOptions={{ ...options, fillOpacity: 0.6 }}
          >
            <Popup>
              <div className="text-slate-200 min-w-[160px] font-sans">
                <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 mb-1.5">{t.actor}</div>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-slate-400">Víctima:</span> <span className="font-semibold text-white">{t.victim}</span></div>
                  <div><span className="text-slate-400">Sector:</span> {t.sector}</div>
                  <div><span className="text-slate-400">Fecha:</span> <span className="font-mono text-slate-300">{t.date}</span></div>
                </div>
                <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-slate-800 text-[10px]">
                  <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono font-bold">Riesgo: {t.riskScore}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                    t.status === "Critical" ? "bg-red-950/80 text-red-400 border border-red-800/40" :
                    t.status === "High" ? "bg-orange-950/80 text-orange-400 border border-orange-800/40" :
                    t.status === "Medium" ? "bg-yellow-950/80 text-yellow-400 border border-yellow-800/40" :
                    "bg-green-950/80 text-green-400 border border-green-800/40"
                  }`}>{t.status}</span>
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
