"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

type Props = { geo: Record<string, number> };

const coords: Record<string, [number, number]> = {
  "United States": [39.8283, -98.5795],
  "United Kingdom": [55.3781, -3.436],
  Canada: [56.1304, -106.3468],
  Singapore: [1.3521, 103.8198],
  Germany: [51.1657, 10.4515],
  Australia: [-25.2744, 133.7751],
};

function MapInner({ geo }: Props) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponents, setMapComponents] = useState<Record<string, React.ComponentType<any>> | null>(null);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("react-leaflet").then((mod: any) =>
      setMapComponents(mod)
    );
  }, []);

  if (!mounted || !MapComponents) return <div className="h-64 bg-slate-900 rounded-lg animate-pulse" />;

  const { MapContainer, TileLayer, CircleMarker, Popup } = MapComponents;

  return (
    <MapContainer center={[20, 0]} zoom={2} className="h-64 w-full rounded-lg z-0">
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap" />
      {Object.entries(geo).map(([country, count]) => {
        const pos = coords[country] || [0, 0];
        return (
          <CircleMarker key={country} center={pos} radius={8 + count * 4} pathOptions={{ color: "#22d3ee", fillColor: "#0891b2", fillOpacity: 0.6 }}>
            <Popup>{country}: {count} incidente(s)</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export const ThreatMap = dynamic(() => Promise.resolve(MapInner), { ssr: false });
