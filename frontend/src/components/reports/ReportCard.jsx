import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Reports/ReportsPage.module.css";
import { Calendar, Clock } from "lucide-react";

// ─── Config gravité ────────────────────────────────────────────────────────
const GRAVITE_CONFIG = {
  CRITIQUE: { label: "Critique", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", accent: "critique" },
  ELEVEE:   { label: "Élevée",   bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", accent: "elevee"   },
  MOYENNE:  { label: "Moyenne",  bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", accent: "moyenne"  },
  FAIBLE:   { label: "Faible",   bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", accent: "faible"   },
};

// ─── Config statut ─────────────────────────────────────────────────────────
// We detect statuses both from the project's workflow labels and common patterns
function getStatusConfig(statut) {
  if (!statut) return { label: "Ouvert", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
  const lower = statut.toLowerCase();
  if (lower.includes("done") || lower.includes("termin") || lower.includes("released") || lower.includes("fermé") || lower.includes("closed") || lower.includes("resolv"))
    return { label: statut, bg: "#E3FCEF", color: "#006644", border: "#ABF5D1" };
  if (lower.includes("progress") || lower.includes("cours") || lower.includes("review") || lower.includes("revue") || lower.includes("test"))
    return { label: statut, bg: "#EAF2FF", color: "#0052CC", border: "#B3D4FF" };
  // Default: treat as "open/todo"
  return { label: statut, bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
}

/**
 * Formats a raw date string (e.g. "2026-06-23 14:30:00") into a friendly label.
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ReportCard({ report, user, index }) {
  const navigate = useNavigate();

  // gravite is already mapped to CRITIQUE/ELEVEE/MOYENNE/FAIBLE by the parent page
  const gravite = GRAVITE_CONFIG[report.gravite] || GRAVITE_CONFIG.MOYENNE;
  const status  = getStatusConfig(report.status);

  // Use assignee info from API if available, fallback to the passed user
  const displayName     = report.assigneeName || user.name;
  const displayInitials = report.assigneeInitials || user.initials;

  /**
   * Navigate to the project's backlog so the user can see the full task detail.
   * We set the selectedProjectId in localStorage (as other pages rely on it)
   * and then navigate to /backlog.
   */
  const handleConsulter = () => {
    if (report.projectId) {
      localStorage.setItem("selectedProjectId", String(report.projectId));
      // Also store the project key if available
      if (report.projectKey) {
        localStorage.setItem("selectedProjectKey", report.projectKey);
      }
    }
    navigate("/backlog");
  };

  return (
    <div
      className={`${styles.reportCard} ${styles[gravite.accent]}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* ── Ligne du haut : titre + badges ── */}
      <div className={styles.cardTop}>
        <h4 className={styles.cardTitle}>{report.title}</h4>
        <div className={styles.cardBadges}>
          <span
            className={styles.badge}
            style={{ background: gravite.bg, color: gravite.color, border: `1px solid ${gravite.border}` }}
          >
            {gravite.label}
          </span>
          <span
            className={styles.badge}
            style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
          >
            {status.label}
          </span>
          {report.sprintName && (
            <span
              className={styles.badge}
              style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}
            >
              {report.sprintName}
            </span>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {report.description && (
        <p className={styles.cardDesc}>{report.description}</p>
      )}

      {/* ── Footer : meta + bouton ── */}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>

          {/* Avatar utilisateur */}
          <div className={styles.cardAvatar} title={displayName}>
            {displayInitials}
          </div>

          {/* Date de création */}
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}><Clock size={12} /></span>
            {formatDate(report.createdAt)}
          </span>

          {/* Story points si disponible */}
          {report.storyPoints > 0 && (
            <span className={styles.metaItem}>
              <span className={styles.metaIcon} style={{ fontWeight: 700, fontSize: 11 }}>SP</span>
              {report.storyPoints}
            </span>
          )}
        </div>

        <button className={styles.consultBtn} onClick={handleConsulter}>
          Consulter
        </button>
      </div>
    </div>
  );
}
