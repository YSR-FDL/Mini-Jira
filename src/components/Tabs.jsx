// ─────────────────────────────────────────────────────
//  Tabs.jsx – Navigation onglets (prop drilling simple)
// ─────────────────────────────────────────────────────
import React from "react";

const TABS = [
  { id: "overview",    label: "Vue d'ensemble", icon: "🗂️" },
  { id: "objectives",  label: "Objectifs",       icon: "🎯" },
  { id: "projects",    label: "Projets",          icon: "📁" },
  { id: "congrats",    label: "Félicitations",    icon: "⭐" },
];

export default function Tabs({ activeTab, onTabChange }) {
  return (
    <div className="profile-container">
      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
