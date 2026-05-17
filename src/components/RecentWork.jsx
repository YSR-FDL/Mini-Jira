// ─────────────────────────────────────────────────────
//  RecentWork.jsx
//  Contenu des 4 onglets.  Chaque vue gère son propre
//  state (bio, nouvelle tâche, etc.) avec useState.
// ─────────────────────────────────────────────────────
import React, { useState } from "react";
import { recentWork, objectives, projects, congratulations } from "../data/mockData";

// ── Helpers ────────────────────────────────────────────
const TYPE_META = {
  Story: { label: "S", cls: "type-story" },
  Bug:   { label: "B", cls: "type-bug"   },
  Task:  { label: "T", cls: "type-task"  },
};

const STATUS_META = {
  "Done":        { label: "Terminé",   cls: "s-done"     },
  "In Progress": { label: "En cours",  cls: "s-progress" },
  "In Review":   { label: "En revue",  cls: "s-review"   },
};

// ══════════════════════════════════════════════════════
//  Onglet 1 – Vue d'ensemble
// ══════════════════════════════════════════════════════
function OverviewTab() {
  const [bio, setBio]       = useState(
    "Je travaille mieux quand les exigences sont claires dès le départ. " +
    "Disponible pour les revues de code, pair programming et discussions d'architecture."
  );
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? recentWork
    : recentWork.filter((w) => w.type.toLowerCase() === filter);

  return (
    <>
      {/* Section : Collaborer avec moi */}
      <div className="card" style={{ animation: "fadeUp .25s ease both" }}>
        <div className="card-header">
          <span className="card-title">Collaborer avec moi</span>
        </div>
        <div className="card-body">
          <textarea
            className="bio-textarea"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Décrivez comment vous préférez travailler…"
          />
          <p className="bio-hint">✏️ Cliquez pour modifier · Visible par votre équipe</p>
        </div>
      </div>

      {/* Section : Travail récent */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Travail récent</span>
          {/* Filtre par type */}
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "story", "bug", "task"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "2px 10px", fontSize: 11, borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: filter === f ? "var(--blue-600)" : "var(--n-50)",
                  background:  filter === f ? "var(--blue-100)" : "white",
                  color:       filter === f ? "var(--blue-700)" : "var(--n-400)",
                  cursor: "pointer", fontFamily: "var(--font)", fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "Tous" : f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--n-300)", fontSize: 14 }}>
            Aucun élément pour ce filtre.
          </div>
        )}

        {filtered.map((item, i) => {
          const tm = TYPE_META[item.type]    || TYPE_META.Task;
          const sm = STATUS_META[item.status] || STATUS_META.Done;
          return (
            <div key={item.id} className="work-item" style={{ animationDelay: `${i * 40}ms` }}>
              <span className={`type-badge ${tm.cls}`}>{tm.label}</span>
              <div className="work-info">
                <div className="work-title">{item.title}</div>
                <div className="work-meta">
                  <span className="work-id">{item.id}</span>
                  <span className="work-dot" />
                  <span className="work-proj">{item.project}</span>
                </div>
              </div>
              <span className={`status-chip ${sm.cls}`}>{sm.label}</span>
              <span className="work-date">{item.date}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════
//  Onglet 2 – Objectifs
// ══════════════════════════════════════════════════════
function ObjectivesTab() {
  const [list, setList]         = useState(objectives);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState("");
  const [dueDate, setDueDate]   = useState("");
  const [errors, setErrors]     = useState({});

  const handleAdd = () => {
    const newErrors = {};
    if (!title.trim())   newErrors.title   = "Titre requis";
    if (!dueDate.trim()) newErrors.dueDate = "Date requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setList((prev) => [
      ...prev,
      { id: Date.now(), title: title.trim(), progress: 0, dueDate, color: "#0052CC" },
    ]);
    setTitle("");
    setDueDate("");
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="card" style={{ animation: "fadeUp .25s ease both" }}>
      <div className="card-header">
        <span className="card-title">Mes Objectifs</span>
        <button className="btn-link" onClick={() => setShowForm((v) => !v)}>
          + Ajouter
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--n-30)", background: "var(--n-10)" }}>
          <div className="form-group">
            <label className="form-label">Titre de l'objectif</label>
            <input
              className={`form-input${errors.title ? " error" : ""}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder="Ex : Finir le rapport PFA"
            />
            {errors.title && <p className="form-error">⚠ {errors.title}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Date d'échéance</label>
            <input
              className={`form-input${errors.dueDate ? " error" : ""}`}
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: "" })); }}
              placeholder="Ex : 30 juin 2025"
            />
            {errors.dueDate && <p className="form-error">⚠ {errors.dueDate}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-save" onClick={handleAdd}>Ajouter</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      {list.map((obj, i) => (
        <div key={obj.id} className="obj-item" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="obj-header">
            <span className="obj-title">{obj.title}</span>
            <span className="obj-pct">{obj.progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${obj.progress}%`, background: obj.color }} />
          </div>
          <p className="obj-due">Échéance : {obj.dueDate}</p>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  Onglet 3 – Projets
// ══════════════════════════════════════════════════════
function ProjectsTab() {
  const [list, setList]         = useState(projects);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [key, setKey]           = useState("");
  const [type, setType]         = useState("Scrum");
  const [errors, setErrors]     = useState({});

  const handleAdd = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nom requis";
    if (!key.trim())  newErrors.key  = "Clé requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const colors = ["#0052CC", "#6554C0", "#00875A", "#FF5630", "#00B8D9"];
    setList((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), key: key.trim().toUpperCase(),
        type, lead: "Lamachi Khalid", tasks: 0, color: colors[prev.length % colors.length] },
    ]);
    setName(""); setKey(""); setErrors({}); setShowForm(false);
  };

  return (
    <div className="card" style={{ animation: "fadeUp .25s ease both" }}>
      <div className="card-header">
        <span className="card-title">Mes Projets</span>
        <button className="btn-link" onClick={() => setShowForm((v) => !v)}>
          + Créer un projet
        </button>
      </div>

      {showForm && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--n-30)", background: "var(--n-10)" }}>
          <div className="form-group">
            <label className="form-label">Nom du projet</label>
            <input
              className={`form-input${errors.name ? " error" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="Ex : Mini Jira v2"
            />
            {errors.name && <p className="form-error">⚠ {errors.name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Clé (3-5 lettres)</label>
            <input
              className={`form-input${errors.key ? " error" : ""}`}
              value={key}
              onChange={(e) => { setKey(e.target.value); setErrors((p) => ({ ...p, key: "" })); }}
              placeholder="Ex : MJV2"
              maxLength={5}
            />
            {errors.key && <p className="form-error">⚠ {errors.key}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Scrum</option>
              <option>Kanban</option>
              <option>Simple</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-save" onClick={handleAdd}>Créer</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      {list.map((p) => (
        <div key={p.id} className="proj-item">
          <div className="proj-icon" style={{ background: p.color }}>{p.key}</div>
          <div className="proj-info">
            <div className="proj-name">{p.name}</div>
            <div className="proj-meta">{p.type} · Lead : {p.lead}</div>
          </div>
          <span className="tasks-badge">{p.tasks} tâches</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  Onglet 4 – Félicitations
// ══════════════════════════════════════════════════════
function CongratsTab() {
  return (
    <div className="card" style={{ animation: "fadeUp .25s ease both" }}>
      <div className="card-header">
        <span className="card-title">Félicitations reçues</span>
      </div>
      {congratulations.map((c, i) => (
        <div key={c.id} className="congrats-item" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="congrats-emoji">{c.emoji}</div>
          <div>
            <div className="congrats-from">{c.from}</div>
            <div className="congrats-msg">{c.message}</div>
            <div className="congrats-date">{c.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  Export principal
// ══════════════════════════════════════════════════════
export default function RecentWork({ activeTab }) {
  if (activeTab === "overview")   return <OverviewTab />;
  if (activeTab === "objectives") return <ObjectivesTab />;
  if (activeTab === "projects")   return <ProjectsTab />;
  if (activeTab === "congrats")   return <CongratsTab />;
  return null;
}
