import React, { useState, useEffect } from "react";
import ProjectLayout from "../../components/layout/ProjectLayout";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import "../../styles/Project/Overview.css";
import ActionBtn from "../../components/ui/ActionBtn";
import axios from "axios";
import { projectService } from "../../services/projectService";
import { activityService } from "../../services/activityService";

// Static fallback for members and activities to keep visual richness
const fallbackMembers = [
  {
    id: 1,
    name: "Yassir Rachidi",
    role: "Product Owner",
    initials: "YR",
    bgColor: "#ef9f27",
  },
  {
    id: 2,
    name: "Yasser Rachidi",
    role: "Scrum Master",
    initials: "YR",
    bgColor: "#185fa5",
  },
  {
    id: 3,
    name: "Khalid",
    role: "Développeur",
    initials: "KL",
    bgColor: "#ef9f27",
  },
];

const fallbackActivity = [
  {
    id: 1,
    name: "Yassir Rachidi",
    initials: "YR",
    bgColor: "#ef9f27",
    action: "a créé la tâche",
    issueName: "Intégration du CSS unifié",
    time: "Il y a 2 heures",
  },
  {
    id: 2,
    name: "Yasser Rachidi",
    initials: "YR",
    bgColor: "#185fa5",
    action: "a déplacé la tâche",
    issueName: "Configurer la base de données SQLite",
    targetState: "Terminé",
    time: "Il y a 4 heures",
  },
];

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;

    const fetchMetrics = dashboardService.getMetrics(projectId);

    const getAvatarColor = (name) => {
      const colors = [
        { bg: "#0052CC", color: "#FFFFFF" },
        { bg: "#00875A", color: "#FFFFFF" },
        { bg: "#FF8B00", color: "#FFFFFF" },
        { bg: "#DE350B", color: "#FFFFFF" },
        { bg: "#6554C0", color: "#FFFFFF" },
      ];
      let sum = 0;
      for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
      }
      return colors[sum % colors.length];
    };

    const fetchMembers = async () => {
      try {
        const projectData = await projectService.getProjectById(projectId);
        if (!projectData) return;

        let teamMembers = [];
        if (projectData.idTeam > 0) {
          const response = await axios.get(`http://localhost:8080/Backend_PFA/GetTeam?id=${projectData.idTeam}`);
          if (response.data && response.data.membres) {
             teamMembers = response.data.membres;
          }
        }

        const usersResponse = await axios.get("http://localhost:8080/Backend_PFA/GetAllUsers");
        const allUsers = usersResponse.data || [];

        const membersMap = new Map();
        
        teamMembers.forEach((m) => {
          membersMap.set(m.id, { ...m, role: "Développeur" });
        });

        const rolesToAdd = [
          { id: projectData.idCreateur, role: "Créateur / Chef de projet" },
          { id: projectData.idSM, role: "Scrum Master (SM)" },
          { id: projectData.idPO, role: "Product Owner (PO)" }
        ];

        rolesToAdd.forEach((r) => {
          if (r.id) {
            const existing = membersMap.get(r.id);
            if (existing) {
               existing.role = r.role;
            } else {
               const u = allUsers.find(x => x.id === r.id);
               if (u) {
                 membersMap.set(u.id, { ...u, role: r.role });
               }
            }
          }
        });

        const finalMembersList = Array.from(membersMap.values()).map((m) => {
          const nom = m.nom || "";
          const prenom = m.prenom || "";
          const fullName = nom + " " + prenom;
          const initials = ((nom[0] || "") + (prenom[0] || "")).toUpperCase() || "U";
          const colors = getAvatarColor(nom);
          return {
            id: m.id,
            name: fullName,
            role: m.role,
            initials: initials,
            bgColor: colors.bg,
            textColor: colors.color,
          };
        });

        setMembers(finalMembersList);

      } catch (e) {
        console.error("Error fetching members", e);
      }
    };

    const fetchActivities = activityService.getProjectActivities(projectId);

    Promise.all([fetchMetrics, fetchMembers(), fetchActivities])
      .then(([res, _membersRes, actsRes]) => {
        setData(res);
        setActivities(actsRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching overview metrics:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <ProjectLayout activeTab="overview">
        <div
          className="overview-container scroll"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>
            Chargement des données du tableau de bord...
          </p>
        </div>
      </ProjectLayout>
    );
  }

  // Extract metrics
  const metrics = {
    totalIssues: data.totalIssues || 0,
    completed: data.completed || 0,
    inProgress: data.inProgress || 0,
    overdue: data.overdue || 0,
  };

  const activeSprintSummary = data.activeSprintSummary || {
    sprintName: "Aucun sprint actif",
    startDate: "N/A",
    endDate: "N/A",
    daysRemaining: 0,
    totalCompleted: 0,
    totalIssues: 0,
    distribution: {},
  };

  const {
    sprintName,
    startDate,
    endDate,
    daysRemaining,
    distribution,
    totalCompleted,
    totalIssues,
    totalPoints,
    completedPoints,
  } = activeSprintSummary;
  
  // Helper to map statuses to specific colors
  const getStatusColor = (statusName) => {
    const s = statusName.toLowerCase();
    if (s.includes('faire') || s.includes('todo')) return '#cbd5e1'; // gray
    if (s.includes('cours') || s.includes('progress')) return '#3b82f6'; // blue
    if (s.includes('revue') || s.includes('review') || s.includes('test')) return '#f59e0b'; // orange
    if (s.includes('terminé') || s.includes('done') || s.includes('termine')) return '#10b981'; // green
    return '#94a3b8'; // default gray
  };

  // Build distribution display from dynamic keys
  const distributionEntries = distribution ? Object.entries(distribution) : [];

  // Sort distribution entries logically
  const statusOrder = {
    'à faire': 1, 'todo': 1,
    'en cours': 2, 'in progress': 2,
    'en revue': 3, 'review': 3, 'test': 3,
    'terminé': 4, 'done': 4
  };

  const sortedDistribution = [...distributionEntries].sort((a, b) => {
    const orderA = statusOrder[a[0].toLowerCase()] || 99;
    const orderB = statusOrder[b[0].toLowerCase()] || 99;
    return orderA - orderB;
  });

  const byType = data.byType || [];
  const byPriority = data.byPriority || [];

  return (
    <ProjectLayout activeTab="overview">
      <div className="overview-container scroll">
        {/* SECTION 2 - Métriques */}
        <section className="overview-section metrics-section">
          <div className="metric-card">
            <h3 className="metric-title">Total issues</h3>
            <p className="metric-value">{metrics.totalIssues}</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-title">Terminées</h3>
            <p className="metric-value">{metrics.completed}</p>
            <span className="metric-subtitle">
              {metrics.totalIssues > 0
                ? Math.round((metrics.completed / metrics.totalIssues) * 100)
                : 0}
              % du total
            </span>
          </div>
          <div className="metric-card">
            <h3 className="metric-title">En cours</h3>
            <p className="metric-value">{metrics.inProgress}</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-title">Restantes</h3>
            <p className="metric-value">
              {metrics.totalIssues - metrics.completed}
            </p>
            <span className="metric-subtitle">
              non terminées
            </span>
          </div>
        </section>

        {/* SECTION 3 - Sprint actif */}
        <section className="overview-section active-sprint-section">
          <div className="sprint-card-header">
            <div>
              <h2 className="section-title">Sprint actif</h2>
              <h3 className="sprint-name">{sprintName}</h3>
              <p className="sprint-dates">
                {startDate} — {endDate}
              </p>
            </div>
            <div className="sprint-countdown">J-{daysRemaining}</div>
          </div>

          <div className="sprint-progress-block">
            <div className="sprint-stats-header">
              <span className="stat-text">Progression</span>
              <span className="stat-ratio">
                {totalPoints > 0 
                  ? `${completedPoints} / ${totalPoints} points terminés`
                  : `${totalCompleted} / ${totalIssues} issues terminées`
                }
              </span>
            </div>
            <div className="pbar-wrap overview-pbar">
              <div className="pbar-bg" style={{ display: 'flex', overflow: 'hidden' }}>
                {sortedDistribution.map(([status, count]) => {
                  const width = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
                  if (width === 0) return null;
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${width}%`,
                        backgroundColor: getStatusColor(status),
                        height: '100%',
                        transition: 'width 0.5s ease-in-out'
                      }}
                      title={`${status}: ${count}`}
                    ></div>
                  );
                })}
              </div>
            </div>
            <div className="sprint-distribution">
              {sortedDistribution.length > 0 ? (
                sortedDistribution.map(([status, count]) => (
                  <span key={status} className="dist-item">
                    <span className="dot" style={{
                      backgroundColor: getStatusColor(status)
                    }}></span> {status} ({count})
                  </span>
                ))
              ) : (
                <>
                  <span className="dist-item">
                    <span className="dot dot-todo" style={{ backgroundColor: '#cbd5e1' }}></span> À faire (0)
                  </span>
                  <span className="dist-item">
                    <span className="dot dot-done" style={{ backgroundColor: '#10b981' }}></span> Terminé (0)
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="sprint-card-footer">
            <Link to="/board" style={{ textDecoration: "none" }}>
              <ActionBtn variant="primary" size="md">
                Voir le board
              </ActionBtn>
            </Link>
          </div>
        </section>

        {/* SECTION 4 - Répartition par type et priorité */}
        <section className="overview-section breakdown-section">
          <div className="breakdown-card">
            <h2 className="section-title">Répartition par type</h2>
            <div className="breakdown-list">
              {byType.length === 0 ? (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Aucun ticket existant
                </p>
              ) : (
                byType.map((item, idx) => (
                  <div key={idx} className="breakdown-row">
                    <span className="breakdown-label">{item.type}</span>
                    <div className="breakdown-bar-wrap">
                      <div
                        className="breakdown-bar"
                        style={{
                          width: `${metrics.totalIssues > 0 ? (item.count / metrics.totalIssues) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-count">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="breakdown-card">
            <h2 className="section-title">Répartition par priorité</h2>
            <div className="breakdown-list">
              {byPriority.length === 0 ? (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Aucun ticket existant
                </p>
              ) : (
                byPriority.map((item, idx) => (
                  <div key={idx} className="breakdown-row">
                    <span className="breakdown-label">{item.priority}</span>
                    <div className="breakdown-bar-wrap">
                      <div
                        className="breakdown-bar"
                        style={{
                          width: `${metrics.totalIssues > 0 ? (item.count / metrics.totalIssues) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-count">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5 & 6 - Activité récente et Membres */}
        <div className="overview-bottom-grid">
          <section className="overview-section activity-section">
            <h2 className="section-title">Activité récente</h2>
            <div className="activity-timeline">
              {activities.length > 0 ? (showAllActivity ? activities : activities.slice(0, 3)).map((event) => {
                let actionText = "";
                let suffixText = "";
                switch (event.actionType) {
                  case "CREATED_TASK": actionText = "a créé la tâche"; break;
                  case "STATUS_CHANGE": actionText = "a déplacé la tâche"; suffixText = ` vers ${event.newValue}`; break;
                  case "ASSIGNEE_CHANGE": actionText = "a réassigné la tâche"; break;
                  case "SPRINT_CHANGE": actionText = "a changé le sprint de"; break;
                  case "POINTS_UPDATE": actionText = "a estimé les points de"; suffixText = ` à ${event.newValue}`; break;
                  case "DELIVERABLE_SUBMIT": actionText = "a mis à jour le livrable de"; break;
                  default: actionText = "a modifié la tâche"; break;
                }

                return (
                  <div key={event.id} className="timeline-item">
                    <div
                      className="timeline-avatar"
                      style={{ backgroundColor: event.user.bgColor || "#ef9f27", color: "#FFF" }}
                    >
                      {event.user.initials}
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-text">
                        <span className="timeline-name">{event.user.name}</span>{" "}
                        {actionText}{" "}
                        <span className="timeline-issue">{event.taskTitle}</span>
                        {suffixText}
                      </p>
                      <span className="timeline-time">{new Date(event.dateCreation).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Aucune activité récente.</p>
              )}
              {activities.length > 3 && (
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button
                    className="btn-link"
                    onClick={() => setShowAllActivity(!showAllActivity)}
                    style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}
                  >
                    {showAllActivity ? "Voir moins" : `Voir plus d'historique (${activities.length - 3})`}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="overview-section members-section">
            <div className="members-header">
              <h2 className="section-title">Membres du projet</h2>
              <Link to="/settings" style={{ textDecoration: "none" }}>
                <button className="btn-manage-members">Gérer</button>
              </Link>
            </div>
            <div className="members-grid">
              {members.length > 0 ? (
                members.map((m) => (
                  <div key={m.id} className="member-card">
                    <div
                      className="member-card-avatar"
                      style={{ backgroundColor: m.bgColor, color: m.textColor }}
                    >
                      {m.initials}
                    </div>
                    <div className="member-card-info">
                      <h4 className="member-card-name">{m.name}</h4>
                      <p className="member-card-role">{m.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "16px",
                    color: "var(--text-soft)",
                    fontSize: "14px",
                    textAlign: "center",
                    gridColumn: "1 / -1",
                  }}
                >
                  Aucune équipe assignée à ce projet. Associez une équipe depuis
                  l'en-tête du projet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProjectLayout>
  );
}
