import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          padding: "8px 12px",
          boxShadow: "var(--shadow-md)",
          fontSize: "13px",
          color: "var(--text-dark)",
          fontFamily: "var(--font-body)",
        }}
      >
        <strong style={{ color: d.fill }}>{label}</strong>
        <div>Tâches : {d.value}</div>
      </div>
    );
  }
  return null;
};

export default function PriorityChart({ taskPriorityData = [] }) {
  return (
    <div className="card">
      <div className="cardHeader">
        <span className="cardTitle">
          <AlertTriangle size={15} />
          Répartition par Priorité
        </span>
      </div>

      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={taskPriorityData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barSize={34}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "var(--text-faint)", fontFamily: "var(--font-body)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-faint)", fontFamily: "var(--font-body)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              {taskPriorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chartLegend">
        {taskPriorityData.map((d) => (
          <div className="legendItem" key={d.name}>
            <div className="legendDot" style={{ background: d.color }} />
            {d.name} — <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
