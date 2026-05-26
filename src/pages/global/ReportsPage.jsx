import { useState } from "react";
import { Bug } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ProjectReportsSection from "../../components/reports/ProjectReportsSection";
import styles from "../../styles/Reports/ReportsPage.module.css";
import { myProjectsWithReports, currentUser } from "../../data/reportsMockData";

// ─── Config gravité pour les stats rapides ────────────────────────────────
const STAT_CONFIG = [
  { key: "CRITIQUE", label: "Critiques",  color: "#DC2626" },
  { key: "ELEVEE",   label: "Élevées",    color: "#D97706" },
  { key: "MOYENNE",  label: "Moyennes",   color: "#2563EB" },
  { key: "FAIBLE",   label: "Faibles",    color: "#16A34A" },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState("Tous");

  // ── Calcul des statistiques globales ──
  const allReports = myProjectsWithReports.flatMap((p) => p.reports);
  const totalReports = allReports.length;

  const statCounts = STAT_CONFIG.reduce((acc, stat) => {
    acc[stat.key] = allReports.filter((r) => r.gravite === stat.key).length;
    return acc;
  }, {});

  // ── Filtrage par gravité ──
  const filteredProjects = myProjectsWithReports
    .map((project) => {
      if (filter === "Tous") return project;
      const filteredReports = project.reports.filter((r) => r.gravite === filter);
      return { ...project, reports: filteredReports };
    })
    .filter((project) => project.reports.length > 0);

  return (
    <Layout activeNav="reports" pageTitle="Bug Reports">
      <div className={styles.page}>

        {/* ── En-tête de page ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <h1 className={styles.pageTitle}>Bug Reports</h1>
            <p className={styles.pageSubtitle}>
              Tous vos bug reports assignés, regroupés par projet et classés par gravité.
            </p>
          </div>

          {/* Résumé utilisateur */}
          <div className={styles.userSummary}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--blue)", lineHeight: 1 }}>
                {totalReports}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>
                reports
              </span>
            </div>
          </div>
        </div>

        {/* ── Statistiques rapides ── */}
        <div className={styles.statsRow}>
          {STAT_CONFIG.map((stat, i) => (
            <div
              key={stat.key}
              className={styles.statCard}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.statDot} style={{ background: stat.color }} />
              <div className={styles.statInfo}>
                <span className={styles.statValue} style={{ color: stat.color }}>
                  {statCounts[stat.key]}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Barre de filtres par gravité ── */}
        <div className={styles.filterBar}>
          {["Tous", "CRITIQUE", "ELEVEE", "MOYENNE", "FAIBLE"].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "Tous"     ? "Tous les reports"
               : f === "CRITIQUE" ? "Critiques"
               : f === "ELEVEE"   ? "Élevées"
               : f === "MOYENNE"  ? "Moyennes"
               :                   "Faibles"}
            </button>
          ))}
        </div>

        {/* ── Liste des projets avec leurs reports ── */}
        <div className={styles.projectList}>
          {filteredProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <Bug size={40} strokeWidth={1.4} />
              <p>Aucun bug report trouvé pour ce filtre.</p>
            </div>
          ) : (
            filteredProjects.map((project, i) => (
              <ProjectReportsSection
                key={project.id}
                project={project}
                user={currentUser}
                index={i}
              />
            ))
          )}
        </div>

      </div>
    </Layout>
  );
}
