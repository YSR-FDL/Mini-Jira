// ─────────────────────────────────────────────────────
//  Sidebar.jsx
//  Gère son propre state : liste équipes + formulaire
// ─────────────────────────────────────────────────────
import React, { useState } from "react";
import { userProfile, teams } from "../data/mockData";

export default function Sidebar() {
  // ── State ──────────────────────────────────────────
  const [teamList, setTeamList]   = useState(teams);
  const [showForm, setShowForm]   = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError]         = useState("");

  // ── Validation + ajout équipe ──────────────────────
  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      setError("Le nom de l'équipe est requis");
      return;
    }

    const colors = ["#0052CC", "#6554C0", "#00875A", "#FF5630", "#00B8D9", "#FF8B00"];
    setTeamList((prev) => [
      ...prev,
      { id: Date.now(), name: newTeamName.trim(), members: 1, color: colors[prev.length % colors.length] },
    ]);

    setNewTeamName("");
    setError("");
    setShowForm(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreateTeam();
    if (e.key === "Escape") { setShowForm(false); setError(""); }
  };

  return (
    <aside className="sidebar">

      {/* ── Informations ── */}
      <div className="sidebar-card">
        <div className="sidebar-title">Informations</div>

        <div className="info-row">
          <span>📧</span>
          <div>
            <span className="info-label">Email</span>
            <span className="info-value">{userProfile.email}</span>
          </div>
        </div>

        <div className="info-row">
          <span>📍</span>
          <div>
            <span className="info-label">Localisation</span>
            <span className="info-value">{userProfile.location}</span>
          </div>
        </div>

        <div className="info-row">
          <span>🎓</span>
          <div>
            <span className="info-label">Département</span>
            <span className="info-value">{userProfile.department}</span>
          </div>
        </div>
      </div>

      {/* ── Équipes ── */}
      <div className="sidebar-card">
        <div className="sidebar-title">Équipes</div>

        {teamList.map((team) => (
          <div key={team.id} className="team-item">
            <span className="team-dot" style={{ background: team.color }} />
            <span className="team-name">{team.name}</span>
            <span className="team-count">{team.members} membres</span>
          </div>
        ))}

        {/* Formulaire inline */}
        {showForm && (
          <div className="new-team-row">
            <input
              autoFocus
              className={`new-team-input${error ? " error" : ""}`}
              value={newTeamName}
              onChange={(e) => { setNewTeamName(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Nom de l'équipe…"
            />
            <button className="new-team-ok" onClick={handleCreateTeam}>OK</button>
          </div>
        )}

        {error && (
          <p className="form-error" style={{ padding: "0 16px 8px" }}>⚠ {error}</p>
        )}

        <button
          className="create-team-btn"
          onClick={() => { setShowForm((v) => !v); setError(""); }}
        >
          + Créer une équipe
        </button>
      </div>

    </aside>
  );
}
