import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutList } from "lucide-react";
import { taskStatusData } from "../../data/dashboardMockData";

const CustomTooltip = ({ active, payload }) => {
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
        <strong style={{ color: d.payload.color }}>{d.name}</strong>
        <div>Tâches : {d.value}</div>
      </div>
    );
  }
  return null;
};

export default function TaskStatusChart() {
  const total = taskStatusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card">
      <div className="cardHeader">
        <span className="cardTitle">
          <LayoutList size={15} />
          Répartition des Tâches
        </span>
      </div>

      <div className="chartWrap" style={{ position: "relative", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={taskStatusData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {taskStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-title)",
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text-dark)",
              lineHeight: 1,
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              fontWeight: 500,
              marginTop: 3,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total
          </div>
        </div>
      </div>

      <div className="chartLegend">
        {taskStatusData.map((d) => (
          <div className="legendItem" key={d.name}>
            <div className="legendDot" style={{ background: d.color }} />
            {d.name} — <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
