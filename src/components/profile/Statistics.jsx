import React from "react";
import s from "../../styles/Profile/Profile.module.css";

export default function Statistics({ user }) {
  const boxes = [
    { label: "TACHES",    value: user?.tachesCount || 0,    highlight: false },
    { label: "PROJECTS", value: user?.projetsCount || 0, highlight: false },
    { label: "COLLABS",  value: user?.collabsCount || 0,  highlight: false },
    { label: "SCORE",    value: user?.score || 0,    highlight: true  },
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
