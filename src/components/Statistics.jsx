import React from "react";
import { stats } from "../data/mockData";
import s from "../styles/Profile.module.css";

export default function Statistics() {
  const boxes = [
    { label: "TACHES",    value: stats.taches,    highlight: false },
    { label: "PROJECTS", value: stats.projets, highlight: false },
    { label: "COLLABS",  value: stats.collabs,  highlight: false },
    { label: "SCORE",    value: stats.score,    highlight: true  },
  ];

  return (
    <div className={s.statsCard}>
      <div className={s.statsTitle}>Statistiques</div>
      <div className={s.statsGrid}>
        {boxes.map((b) => (
          <div key={b.label} className={`${s.statBox}${b.highlight ? " " + s.highlight : ""}`}>
            <div className={s.statLabel}>{b.label}</div>
            <div className={s.statValue}>{b.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
