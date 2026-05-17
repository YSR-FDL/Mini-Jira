// ─────────────────────────────────────────────────────
//  ProfileHeader.jsx
//  Avatar + Nom + Bouton paramètres (modal useState)
// ─────────────────────────────────────────────────────
import React, { useState } from "react";
import { userProfile } from "../data/mockData";

export default function ProfileHeader() {
  // ── State paramètres ───────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [fullName, setFullName]         = useState(userProfile.fullName);
  const [role, setRole]                 = useState(userProfile.role);
  const [location, setLocation]         = useState(userProfile.location);
  const [errors, setErrors]             = useState({});
  const [saved, setSaved]               = useState(false);

  // ── Valeurs temporaires dans le modal ──────────────
  const [tmpName, setTmpName]         = useState(fullName);
  const [tmpRole, setTmpRole]         = useState(role);
  const [tmpLocation, setTmpLocation] = useState(location);

  // ── Ouvrir le modal ────────────────────────────────
  const openSettings = () => {
    setTmpName(fullName);
    setTmpRole(role);
    setTmpLocation(location);
    setErrors({});
    setSaved(false);
    setShowSettings(true);
  };

  // ── Valider et sauvegarder ─────────────────────────
  const handleSave = () => {
    const newErrors = {};

    if (!tmpName.trim()) newErrors.name = "Le nom est requis";
    if (!tmpRole.trim()) newErrors.role = "Le rôle est requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setFullName(tmpName.trim());
    setRole(tmpRole.trim());
    setLocation(tmpLocation.trim());
    setSaved(true);
    setTimeout(() => setShowSettings(false), 900);
  };

  const initials = fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Bannière */}
      <div className="profile-banner" />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-inner">

            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-avatar-online" title="En ligne" />
            </div>

            {/* Nom + rôle */}
            <div className="profile-name-block">
              <h1 className="profile-name">{fullName}</h1>
              <p className="profile-role">{role} · {location}</p>
            </div>

            {/* Bouton paramètres */}
            <button className="btn-settings" onClick={openSettings}>
              ⚙️ Paramètres du compte
            </button>

          </div>
        </div>
      </div>

      {/* ── Modal Paramètres ─────────────────────── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Paramètres du compte</h2>

            {saved && (
              <div className="success-msg">✅ Modifications enregistrées !</div>
            )}

            {/* Nom complet */}
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className={`form-input${errors.name ? " error" : ""}`}
                value={tmpName}
                onChange={(e) => {
                  setTmpName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                }}
              />
              {errors.name && <p className="form-error">⚠ {errors.name}</p>}
            </div>

            {/* Rôle */}
            <div className="form-group">
              <label className="form-label">Rôle</label>
              <input
                className={`form-input${errors.role ? " error" : ""}`}
                value={tmpRole}
                onChange={(e) => {
                  setTmpRole(e.target.value);
                  if (errors.role) setErrors((p) => ({ ...p, role: "" }));
                }}
              />
              {errors.role && <p className="form-error">⚠ {errors.role}</p>}
            </div>

            {/* Localisation */}
            <div className="form-group">
              <label className="form-label">Localisation</label>
              <input
                className="form-input"
                value={tmpLocation}
                onChange={(e) => setTmpLocation(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSettings(false)}>
                Annuler
              </button>
              <button className="btn-save" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
