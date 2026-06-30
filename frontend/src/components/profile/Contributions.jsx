import React, { useState } from "react";
import { Clock, Code2, Palette, CheckSquare} from "lucide-react";
import s from "../../styles/Profile/Profile.module.css";

const statusStyles = {
  "En cours": {
    bg: "#DBEAFE",
    color: "#2563EB"
  },

  "En Revue": {
    bg: "#F3F4F6",
    color: "#6b7280"
  },

  "Termine": {
    bg: "#DCFCE7",
    color: "#16A34A"
  }
};

function ContribItem({ item, user }) {
  const iconStyle = statusStyles[item.status] || {bg:"#eee", color:"#333"};
  return (
    <div className={s.contribItem}>
      <div className={s.contribItemTop}>
        <div className={s.contribIcon} style={{background:iconStyle.bg, color:iconStyle.color}}>
          <CheckSquare size={17}/>
        </div>
        <span className={s.statusBadge} style={{ background: item.statusBg, color: item.statusColor }}>
          {item.status}
        </span>
      </div>

      <div className={s.contribItemTitle}>{item.title}</div>
      <div className={s.contribItemDesc}>{item.description}</div>

      <div className={s.progressRow}>
        <div className={s.progressTrack}>
          <div
            className={s.progressFill}
            style={{ width: `${item.progress || 0}%`, background: item.progressColor }}
          />
        </div>
        <span className={s.progressPct}>{item.progress || 0}%</span>
      </div>

      <div className={s.contribItemFooter}>
        <span className={s.dueDate}>
          <Clock size={11} strokeWidth={2} />
          Due: {item.dueDate}
        </span>
      </div>
    </div>
  );
}

export default function Contributions({ user }) {
  const [activeTab, setActiveTab] = useState("active");
  const list = activeTab === "active" ? (user?.contributions || []) : (user?.completedContributions || []);

  return (
    <div className={s.contribCard}>
      <div className={s.contribHeader}>
        <span className={s.contribTitle}>Contributions</span>
        <div className={s.tabToggle}>
          <button className={`${s.tabToggleBtn}${activeTab === "active" ? " " + s.active : ""}`} onClick={() => setActiveTab("active")}>
            Active
          </button>
          <button className={`${s.tabToggleBtn}${activeTab === "completed" ? " " + s.active : ""}`} onClick={() => setActiveTab("completed")}>
            Completed
          </button>
        </div>
      </div>

      <div className={s.contribGrid}>
        {list.map((item) => (
          <ContribItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
