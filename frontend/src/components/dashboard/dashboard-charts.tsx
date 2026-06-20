"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#94a3b8" } } },
  scales: {
    x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
    y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
  },
};

export function DashboardCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Sectores afectados</CardTitle></CardHeader>
        <CardContent className="h-64">
          <Bar
            data={{
              labels: data.sectors.labels,
              datasets: [{ label: "Alertas", data: data.sectors.data, backgroundColor: "rgba(168, 85, 247, 0.65)", borderColor: "#a855f7" }],
            }}
            options={{ ...chartOptions, plugins: { legend: { display: false } } }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Estado de verificación</CardTitle></CardHeader>
        <CardContent className="h-64">
          <Doughnut
            data={{
              labels: data.verification.labels,
              datasets: [{ data: data.verification.data, backgroundColor: ["#22c55e", "#eab308", "#ef4444"], borderColor: "#0f172a", borderWidth: 2 }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { color: "#94a3b8" } } } }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
