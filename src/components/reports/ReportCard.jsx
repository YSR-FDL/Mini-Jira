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
const STATUS_CONFIG = {
  OPEN:        { label: "Ouvert",     bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  IN_PROGRESS: { label: "En cours",   bg: "#EAF2FF", color: "#0052CC", border: "#B3D4FF" },
  RESOLVED:    { label: "Résolu",     bg: "#E3FCEF", color: "#006644", border: "#ABF5D1" },
  CLOSED:      { label: "Fermé",      bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

export default function ReportCard({ report, user, index }) {
  const gravite = GRAVITE_CONFIG[report.gravite] || GRAVITE_CONFIG.MOYENNE;
  const status  = STATUS_CONFIG[report.status]   || STATUS_CONFIG.OPEN;

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
        </div>
      </div>

      {/* ── Description ── */}
      <p className={styles.cardDesc}>{report.description}</p>

      {/* ── Footer : meta + bouton ── */}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>

          {/* Avatar utilisateur */}
          <div className={styles.cardAvatar} title={user.name}>
            {user.initials}
          </div>

          {/* Date de création */}
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}><Clock size={12} /></span>
            {report.createdAt}
          </span>

          {/* Date limite */}
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}><Calendar size={12} /></span>
            {report.deadline}
          </span>
        </div>

        <button className={styles.consultBtn}>Consulter</button>
      </div>
    </div>
  );
}
