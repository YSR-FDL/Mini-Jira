import { useState, useEffect } from "react";
import { Bug, AlertTriangle, X } from "lucide-react";
import axios from "axios";
import styles from "../../styles/Reports/CreateBugReportModal.module.css";
import { getRequesterId } from "../../services/authHelper";

const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critique", color: "#DC2626" },
  { value: "high",     label: "Élevée",   color: "#D97706" },
  { value: "medium",   label: "Moyenne",   color: "#2563EB" },
  { value: "low",      label: "Faible",    color: "#16A34A" },
];

const API = "http://localhost:8080/Backend_PFA";

export default function CreateBugReportModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the user's projects when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const userId = getRequesterId();
    if (!userId) return;

    axios
      .get(`${API}/GetBugReports?userId=${userId}`)
      .then((res) => {
        const projectList = (res.data.projects || []).map((p) => ({
          id: p.id,
          name: p.title,
        }));
        setProjects(projectList);
        // If user had a selected project, pre-select it
        const stored = localStorage.getItem("selectedProjectId");
        if (stored && projectList.some((p) => p.id === parseInt(stored, 10))) {
          setProjectId(stored);
        } else if (projectList.length > 0) {
          setProjectId(String(projectList[0].id));
        }
      })
      .catch(() => setProjects([]));
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (!projectId) {
      setError("Veuillez sélectionner un projet.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        titre: title.trim(),
        description: description.trim(),
        priorite: priority,
        typeTache: "Bug",
        idProject: parseInt(projectId, 10),
        statut: "todo",
        storyPoints: 0,
        requesterId: getRequesterId(),
      };

      const res = await axios.post(`${API}/CreateTask`, payload);

      if (res.data.message === "success") {
        resetForm();
        onCreated();
      } else {
        setError(res.data.error || "Échec de la création du bug report.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erreur serveur. Réessayez.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Bug size={20} />
            </div>
            <h2 className={styles.headerTitle}>Signaler un bug</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Project */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Projet *</label>
            <select
              className={styles.input}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Titre du bug *</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: L'application crash au démarrage sans réseau"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les étapes pour reproduire le bug, le comportement attendu vs. observé..."
              rows={4}
            />
          </div>

          {/* Priority */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Gravité *</label>
            <div className={styles.priorityGroup}>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.priorityBtn} ${
                    priority === opt.value ? styles.priorityBtnActive : ""
                  }`}
                  style={{
                    "--accent": opt.color,
                    borderColor:
                      priority === opt.value ? opt.color : undefined,
                    background:
                      priority === opt.value ? `${opt.color}10` : undefined,
                    color: priority === opt.value ? opt.color : undefined,
                  }}
                  onClick={() => setPriority(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? "Envoi…" : "Signaler le bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
