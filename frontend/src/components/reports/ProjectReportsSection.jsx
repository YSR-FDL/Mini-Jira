import { useState } from "react";
import { Bug } from "lucide-react";
import styles from "../../styles/Reports/ReportsPage.module.css";
import ReportCard from "./ReportCard";

// ─── Gravity sort order ───────────────────────────────────────────────────
const GRAVITY_ORDER = { CRITIQUE: 0, ELEVEE: 1, MOYENNE: 2, FAIBLE: 3 };

function sortReportsByGravity(reports) {
  return [...reports].sort(
    (a, b) => (GRAVITY_ORDER[a.gravite] ?? 99) - (GRAVITY_ORDER[b.gravite] ?? 99)
  );
}

// ─── Config statut projet ─────────────────────────────────────────────────
const PROJECT_STATUS_CONFIG = {
  ACTIVE:      { bg: "#EAF2FF", color: "#0052CC", border: "#B3D4FF" },
  MAINTENANCE: { bg: "#FFFBEB", color: "#B25000", border: "#FFD8A8" },
  ARCHIVED:    { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

function getProgressColor(progress) {
  if (progress >= 100) return "var(--green)";
  if (progress >= 50)  return "var(--blue)";
  if (progress >= 25)  return "#F79009";
  return "var(--red)";
}

export default function ProjectReportsSection({ project, user, index }) {
  const [open, setOpen] = useState(true);

  const projectStatus  = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.ACTIVE;
  const progressColor  = getProgressColor(project.progress);

  // Trier par gravité avant d'afficher
  const sortedReports  = sortReportsByGravity(project.reports);

  return (
    <div
      className={styles.projectSection}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* ── En-tête du projet (cliquable pour replier) ── */}
      <div className={styles.projectHeader} onClick={() => setOpen((v) => !v)}>

        <div className={styles.projectHeaderLeft}>
          <div className={styles.projectIcon}>
            <Bug size={16} />
          </div>
          <div>
            <div className={styles.projectTitleRow}>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <span
                className={styles.badge}
                style={{
                  background: projectStatus.bg,
                  color:      projectStatus.color,
                  border:     `1px solid ${projectStatus.border}`,
                }}
              >
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className={styles.projectDesc}>{project.description}</p>
            )}
          </div>
        </div>

        <div className={styles.projectHeaderRight}>
          {/* Barre de progression */}
          <div className={styles.projectProgressWrap}>
            <div className={styles.projectProgressTrack}>
              <div
                className={styles.projectProgressFill}
                style={{ width: `${project.progress}%`, background: progressColor }}
              />
            </div>
            <span className={styles.projectProgressPct}>{project.progress}%</span>
          </div>

          {/* Compteur de reports */}
          <span className={styles.reportCount}>
            {project.reports.length} report{project.reports.length > 1 ? "s" : ""}
          </span>

          {/* Chevron */}
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>
        </div>
      </div>

      {/* ── Liste des report cards ── */}
      {open && (
        <div className={styles.reportList}>
          {sortedReports.map((report, i) => (
            <ReportCard key={report.id} report={report} user={user} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
