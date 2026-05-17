// ─────────────────────────────────────────────────────
//  TopNav.jsx – Barre de navigation fixe
// ─────────────────────────────────────────────────────
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const [activeLink, setActiveLink] = useState("Vos travaux");
  const navigate = useNavigate();

  const links = ["Vos travaux", "Projets", "Tableaux", "Équipes"];

  return (
    <header className="topnav">
      {/* Logo */}
      <div className="topnav-logo" onClick={() => navigate("/profile")}>
        <div className="topnav-logo-icon">🔷</div>
        <span className="topnav-logo-text">Mini Jira</span>
      </div>

      <div className="topnav-divider" />

      {/* Liens */}
      <nav className="topnav-links">
        {links.map((label) => (
          <button
            key={label}
            className={`topnav-link${activeLink === label ? " active" : ""}`}
            onClick={() => setActiveLink(label)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Recherche */}
      <div className="topnav-search">
        🔍&nbsp; Rechercher…
      </div>

      {/* Icônes */}
      <div className="topnav-right">
        <button className="topnav-icon-btn" title="Notifications">🔔</button>
        <button className="topnav-icon-btn" title="Aide">❓</button>
        <div
          className="topnav-avatar"
          title="Mon profil"
          onClick={() => navigate("/profile")}
        >
          LK
        </div>
      </div>
    </header>
  );
}
