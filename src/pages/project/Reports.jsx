import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import ProjectLayout from "../../components/layout/ProjectLayout";
import { sprintService } from "../../services/sprintService";
import { taskService } from "../../services/taskService";
import "../../styles/Project/Overview.css";
import "../../styles/Project/Reports.css";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const ACTIVE_STATUSES = ["active", "actif", "en cours"];
const DONE_SPRINT_STATUSES = ["done", "completed", "terminee", "terminée"];

// Normalise un statut de tâche (FR/EN, variations projet) vers 4 buckets
function normalizeStatus(status) {
  const s = (status || "").toLowerCase();
  if (/(done|termin|released|closed|ferm)/.test(s)) return "done";
  if (/(review|revue|testing|test)/.test(s)) return "review";
  if (/(progress|cours)/.test(s)) return "inprogress";
  return "todo";
}

const parseDate = (str) => {
  if (!str) return null;
  // gère "YYYY-MM-DD" et "YYYY-MM-DD HH:mm:ss"
  const d = new Date(String(str).replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const daysBetween = (a, b) =>
  Math.round((startOfDay(b) - startOfDay(a)) / (1000 * 60 * 60 * 24));

const fmtDay = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const sumPoints = (tasks) => tasks.reduce((acc, t) => acc + (t.points || 0), 0);

/* ─── Config statuts pour la distribution ─────────────────────────────── */
const STATUS_BUCKETS = [
  { key: "todo", label: "À faire", color: "#94A3B8" },
  { key: "inprogress", label: "En cours", color: "#3B82F6" },
  { key: "review", label: "En revue", color: "#F59E0B" },
  { key: "done", label: "Terminé", color: "#10B981" },
];

/* ─── Tooltips Recharts ───────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="reports-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color || p.stroke || p.fill }}>
          {p.name} : {p.value ?? "—"}
        </div>
      ))}
    </div>
  );
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;

    Promise.all([
      sprintService.getAll(projectId),
      taskService.getProjectTasks(projectId),
    ])
      .then(([sprintList, taskList]) => {
        setSprints(sprintList || []);
        setTasks(taskList || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des rapports:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <ProjectLayout activeTab="reports">
        <div
          className="reports-container scroll"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <p style={{ color: "var(--text-light)" }}>
            Chargement des rapports du sprint...
          </p>
        </div>
      </ProjectLayout>
    );
  }

  const today = startOfDay(new Date());

  /* ── Sprint actif & ses tâches ── */
  const activeSprint = sprints.find((s) =>
    ACTIVE_STATUSES.includes((s.status || "").toLowerCase()),
  );

  const tasksOf = (sprint) =>
    sprint
      ? tasks.filter((t) => String(t.sprintId) === String(sprint.id))
      : [];

  const activeTasks = activeSprint ? tasksOf(activeSprint) : [];

  // Scope distribution : sprint actif sinon tout le projet
  const distScope = activeSprint ? activeTasks : tasks;

  /* ── SECTION 1 : Métriques ── */
  const completedCount = activeTasks.filter(
    (t) => normalizeStatus(t.status) === "done",
  ).length;
  const totalCount = activeTasks.length;

  const deliveredPoints = sumPoints(
    activeTasks.filter((t) => normalizeStatus(t.status) === "done"),
  );
  const capacityPoints = sumPoints(activeTasks);

  // Issues en retard (projet) : tâche non terminée dont la deadline (fin du sprint) est dépassée
  const sprintById = {};
  sprints.forEach((s) => (sprintById[String(s.id)] = s));

  const overdueIssues = tasks
    .map((t) => {
      if (normalizeStatus(t.status) === "done") return null;
      const sprint = sprintById[String(t.sprintId)];
      const end = sprint ? parseDate(sprint.endDate) : null;
      if (!end || startOfDay(end) >= today) return null;
      return { task: t, deadline: end, lateDays: daysBetween(end, today) };
    })
    .filter(Boolean)
    .sort((a, b) => b.lateDays - a.lateDays);

  const overdueCount = overdueIssues.length;

  // Vélocité par sprint (points livrés = points des tâches terminées)
  const velocityBySprint = sprints
    .map((s) => ({
      sprint: s,
      start: parseDate(s.startDate),
      delivered: sumPoints(
        tasksOf(s).filter((t) => normalizeStatus(t.status) === "done"),
      ),
    }))
    .sort((a, b) => (a.start && b.start ? a.start - b.start : 0));

  // Vélocité moyenne sur les 3 derniers sprints démarrés (ou terminés)
  const startedSprints = velocityBySprint
    .filter((v) => (v.sprint.status || "").toLowerCase() !== "a venir")
    .slice(-3);
  const velocityAvg =
    startedSprints.length > 0
      ? Math.round(
          startedSprints.reduce((acc, v) => acc + v.delivered, 0) /
            startedSprints.length,
        )
      : 0;

  /* ── SECTION 2 : Burndown (sprint actif) ── */
  let burndownData = [];
  if (activeSprint) {
    const start = parseDate(activeSprint.startDate);
    const end = parseDate(activeSprint.endDate);
    if (start && end) {
      const duration = Math.max(daysBetween(start, end), 1);
      const total = capacityPoints;
      const remaining = sumPoints(
        activeTasks.filter((t) => normalizeStatus(t.status) !== "done"),
      );
      const todayIndex = Math.min(
        Math.max(daysBetween(start, today), 0),
        duration,
      );

      for (let d = 0; d <= duration; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + d);
        // Courbe idéale : descente linéaire du total à 0
        const ideal = Math.round((total * (1 - d / duration)) * 10) / 10;
        // Courbe réelle : connue au départ (total) et aujourd'hui (restant).
        // Les jours intermédiaires sont inconnus (pas d'historique de complétion)
        // et reliés par connectNulls.
        let actual = null;
        if (d === 0) actual = total;
        else if (d === todayIndex) actual = remaining;
        burndownData.push({ label: fmtDay(date), ideal, actual });
      }
    }
  }

  /* ── SECTION 3 : Distribution ── */
  const statusCounts = STATUS_BUCKETS.map((b) => ({
    ...b,
    count: distScope.filter((t) => normalizeStatus(t.status) === b.key).length,
  }));
  const distTotal = distScope.length;

  // Par assigné : ouvertes (non terminées) vs terminées
  const assigneeMap = {};
  distScope.forEach((t) => {
    const a = t.assignee;
    const key = a ? String(a.id) : "none";
    if (!assigneeMap[key]) {
      assigneeMap[key] = {
        id: key,
        name: a ? a.name : "Non assigné",
        initials: a ? a.initials : "?",
        bgColor: a ? a.bgColor : "#94A3B8",
        open: 0,
        done: 0,
      };
    }
    if (normalizeStatus(t.status) === "done") assigneeMap[key].done += 1;
    else assigneeMap[key].open += 1;
  });
  const assigneeStats = Object.values(assigneeMap).sort(
    (a, b) => b.open + b.done - (a.open + a.done),
  );
  const maxAssigneeTotal = Math.max(
    1,
    ...assigneeStats.map((a) => a.open + a.done),
  );

  /* ── Rendu ── */
  return (
    <ProjectLayout activeTab="reports">
      <div className="reports-container scroll">
        {/* ── SECTION 1 : Santé du sprint actuel ── */}
        <section className="reports-section-head">
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            Santé du sprint actuel
          </h2>
          <p className="reports-subtitle">
            {activeSprint
              ? activeSprint.name
              : "Aucun sprint actif — les métriques affichent 0."}
          </p>
        </section>

        <section className="overview-section metrics-section">
          <div className="metric-card">
            <h3 className="metric-title">Issues terminées</h3>
            <p className="metric-value">
              {completedCount}
              <span className="metric-value-sub"> / {totalCount}</span>
            </p>
            <span className="metric-subtitle">
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              % du sprint
            </span>
          </div>

          <div className="metric-card">
            <h3 className="metric-title">Story points livrés</h3>
            <p className="metric-value">
              {deliveredPoints}
              <span className="metric-value-sub"> / {capacityPoints}</span>
            </p>
            <span className="metric-subtitle">capacité totale</span>
          </div>

          <div className="metric-card">
            <h3 className="metric-title">Issues en retard</h3>
            <p
              className="metric-value"
              style={{ color: overdueCount > 0 ? "var(--red)" : undefined }}
            >
              {overdueCount}
            </p>
            <span className="metric-subtitle">deadline dépassée</span>
          </div>

          <div className="metric-card">
            <h3 className="metric-title">Vélocité moyenne</h3>
            <p className="metric-value">{velocityAvg}</p>
            <span className="metric-subtitle">
              pts · 3 derniers sprints
            </span>
          </div>
        </section>

        {/* ── SECTION 2 : Burndown Chart ── */}
        <section className="overview-section">
          <h2 className="section-title">Burndown du sprint</h2>
          {activeSprint && burndownData.length > 0 ? (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={burndownData}
                  margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Points restants",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "var(--text-faint)" },
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="ideal"
                    name="Idéale"
                    stroke="#94A3B8"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Réelle"
                    stroke="var(--blue)"
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="reports-empty">
              Aucun sprint actif pour afficher le burndown.
            </p>
          )}
        </section>

        {/* ── SECTION 3 : Distribution des issues ── */}
        <section className="reports-dist-grid">
          {/* Par statut */}
          <div className="overview-section">
            <h2 className="section-title">Distribution par statut</h2>
            {distTotal === 0 ? (
              <p className="reports-empty">Aucune issue.</p>
            ) : (
              <>
                <div className="reports-stacked-bar">
                  {statusCounts.map((b) =>
                    b.count > 0 ? (
                      <div
                        key={b.key}
                        className="reports-stacked-seg"
                        style={{
                          width: `${(b.count / distTotal) * 100}%`,
                          background: b.color,
                        }}
                        title={`${b.label} : ${b.count}`}
                      >
                        {b.count}
                      </div>
                    ) : null,
                  )}
                </div>
                <div className="reports-legend">
                  {statusCounts.map((b) => (
                    <div key={b.key} className="reports-legend-item">
                      <span
                        className="reports-legend-dot"
                        style={{ background: b.color }}
                      />
                      {b.label} — <strong>{b.count}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Par assigné */}
          <div className="overview-section">
            <h2 className="section-title">Charge par assigné</h2>
            {assigneeStats.length === 0 ? (
              <p className="reports-empty">Aucune issue assignée.</p>
            ) : (
              <div className="reports-assignee-list">
                {assigneeStats.map((a) => {
                  const total = a.open + a.done;
                  return (
                    <div key={a.id} className="reports-assignee-row">
                      <div
                        className="reports-avatar"
                        style={{ background: a.bgColor }}
                      >
                        {a.initials}
                      </div>
                      <div className="reports-assignee-body">
                        <div className="reports-assignee-head">
                          <span className="reports-assignee-name">
                            {a.name}
                          </span>
                          <span className="reports-assignee-count">
                            {a.done}/{total}
                          </span>
                        </div>
                        <div className="reports-load-bar">
                          <div
                            className="reports-load-done"
                            style={{
                              width: `${(a.done / maxAssigneeTotal) * 100}%`,
                            }}
                            title={`${a.done} terminées`}
                          />
                          <div
                            className="reports-load-open"
                            style={{
                              width: `${(a.open / maxAssigneeTotal) * 100}%`,
                            }}
                            title={`${a.open} ouvertes`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="reports-legend" style={{ marginTop: 4 }}>
                  <div className="reports-legend-item">
                    <span
                      className="reports-legend-dot"
                      style={{ background: "#10B981" }}
                    />
                    Terminées
                  </div>
                  <div className="reports-legend-item">
                    <span
                      className="reports-legend-dot"
                      style={{ background: "#CBD5E1" }}
                    />
                    Ouvertes
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 4 : Vélocité par sprint ── */}
        <section className="overview-section">
          <h2 className="section-title">Vélocité par sprint</h2>
          {velocityBySprint.length === 0 ? (
            <p className="reports-empty">Aucun sprint.</p>
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={velocityBySprint.map((v) => ({
                    name: v.sprint.name,
                    points: v.delivered,
                  }))}
                  margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
                  barSize={42}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={50}
                    tickFormatter={(v) =>
                      v.length > 18 ? v.slice(0, 16) + "…" : v
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Points livrés",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "var(--text-faint)" },
                    }}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="points" name="Points livrés" radius={[5, 5, 0, 0]}>
                    {velocityBySprint.map((v, i) => (
                      <Cell
                        key={i}
                        fill={
                          ACTIVE_STATUSES.includes(
                            (v.sprint.status || "").toLowerCase(),
                          )
                            ? "var(--blue)"
                            : DONE_SPRINT_STATUSES.includes(
                                  (v.sprint.status || "").toLowerCase(),
                                )
                              ? "#10B981"
                              : "#CBD5E1"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* ── SECTION 5 : Issues en retard ── */}
        <section className="overview-section">
          <h2 className="section-title">
            Issues en retard{" "}
            <span className="reports-count-badge">{overdueCount}</span>
          </h2>
          {overdueCount === 0 ? (
            <p className="reports-empty">
              Aucune issue en retard. Tout est dans les temps.
            </p>
          ) : (
            <div className="reports-overdue-table">
              <div className="reports-overdue-head">
                <span>ID</span>
                <span>Titre</span>
                <span>Assigné</span>
                <span>Deadline</span>
                <span>Retard</span>
              </div>
              {overdueIssues.map(({ task, deadline, lateDays }) => (
                <div key={task.id} className="reports-overdue-row">
                  <span className="reports-overdue-id">{task.id}</span>
                  <span className="reports-overdue-title">{task.title}</span>
                  <span>
                    {task.assignee ? (
                      <span className="reports-assignee-inline">
                        <span
                          className="reports-avatar reports-avatar-sm"
                          style={{ background: task.assignee.bgColor }}
                        >
                          {task.assignee.initials}
                        </span>
                        {task.assignee.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-faint)" }}>
                        Non assigné
                      </span>
                    )}
                  </span>
                  <span>{fmtDay(deadline)}</span>
                  <span className="reports-late">
                    <AlertTriangle size={13} />
                    {lateDays} j
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ProjectLayout>
  );
}
