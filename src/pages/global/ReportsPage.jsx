import { useState, useEffect } from "react";
import { Bug, Loader2, Plus } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ProjectReportsSection from "../../components/reports/ProjectReportsSection";
import CreateBugReportModal from "../../components/reports/CreateBugReportModal";
import styles from "../../styles/Reports/ReportsPage.module.css";
import { bugReportService } from "../../services/bugReportService";

// ─── Config gravité pour les stats rapides ────────────────────────────────
const PRIORITY_TO_GRAVITE = {
  critical: "CRITIQUE",
  high:     "ELEVEE",
  medium:   "MOYENNE",
  low:      "FAIBLE",
};

const STAT_CONFIG = [
  { key: "CRITIQUE", label: "Critiques",  color: "#DC2626" },
  { key: "ELEVEE",   label: "Élevées",    color: "#D97706" },
  { key: "MOYENNE",  label: "Moyennes",   color: "#2563EB" },
  { key: "FAIBLE",   label: "Faibles",    color: "#16A34A" },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState("Tous");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ── Fetch bug reports from backend ──
  const fetchReports = () => {
    setLoading(true);
    bugReportService
      .getBugReports()
      .then((data) => {
        const mapped = (data.projects || []).map((project) => ({
          ...project,
          reports: (project.reports || []).map((r) => ({
            ...r,
            gravite: PRIORITY_TO_GRAVITE[r.priority] || "MOYENNE",
          })),
        }));
        setProjects(mapped);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load bug reports:", err);
        setError("Impossible de charger les bug reports.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleBugCreated = () => {
    setShowModal(false);
    fetchReports(); // refresh the list
  };

  // ── Build the current user from localStorage ──
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = {
    id: storedUser.id,
    name: `${storedUser.prenom || ""} ${storedUser.nom || ""}`.trim() || "Utilisateur",
    initials: `${(storedUser.prenom || "U")[0]}${(storedUser.nom || "")[0] || ""}`.toUpperCase(),
  };

  // ── Calcul des statistiques globales ──
  const allReports = projects.flatMap((p) => p.reports);
  const totalReports = allReports.length;

  const statCounts = STAT_CONFIG.reduce((acc, stat) => {
    acc[stat.key] = allReports.filter((r) => r.gravite === stat.key).length;
    return acc;
  }, {});

  // ── Filtrage par gravité ──
  const filteredProjects = projects
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
            <button
              className={styles.reportBugBtn}
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} />
              Signaler un bug
            </button>
            <div className={styles.summaryDivider} />
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
                  {loading ? "–" : statCounts[stat.key]}
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

        {/* ── Contenu principal ── */}
        <div className={styles.projectList}>
          {loading ? (
            <div className={styles.emptyState}>
              <Loader2 size={32} strokeWidth={1.6} style={{ animation: "spin 1s linear infinite" }} />
              <p>Chargement des bug reports…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <Bug size={40} strokeWidth={1.4} />
              <p>{error}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
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

        {/* ── Modal de signalement de bug ── */}
        <CreateBugReportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreated={handleBugCreated}
        />

      </div>
    </Layout>
  );
}
