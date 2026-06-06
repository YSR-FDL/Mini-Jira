import React, { useState, useEffect } from "react";
import ProjectLayout from "../../components/layout/ProjectLayout";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import "../../styles/Project/Overview.css";
import ActionBtn from "../../components/ui/ActionBtn";
import axios from 'axios';
import { projectService } from '../../services/projectService';

// Static fallback for members and activities to keep visual richness
const fallbackMembers = [
  { id: 1, name: "Yassir Rachidi", role: "Product Owner", initials: "YR", bgColor: "#ef9f27" },
  { id: 2, name: "Yasser Rachidi", role: "Scrum Master", initials: "YR", bgColor: "#185fa5" },
  { id: 3, name: "Khalid", role: "Développeur", initials: "KL", bgColor: "#ef9f27" }
];

const fallbackActivity = [
  { id: 1, name: "Yassir Rachidi", initials: "YR", bgColor: "#ef9f27", action: "a créé la tâche", issueName: "Intégration du CSS unifié", time: "Il y a 2 heures" },
  { id: 2, name: "Yasser Rachidi", initials: "YR", bgColor: "#185fa5", action: "a déplacé la tâche", issueName: "Configurer la base de données SQLite", targetState: "Terminé", time: "Il y a 4 heures" }
];

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const rawId = localStorage.getItem('selectedProjectId');
    const projectId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1;
    
    const fetchMetrics = dashboardService.getMetrics(projectId);
    
    const fetchMembers = async () => {
      try {
        const projectData = await projectService.getProjectById(projectId);
        if (projectData && projectData.idTeam) {
          const response = await axios.get(`http://localhost:8080/GetTeam?id=${projectData.idTeam}`);
          if (response.data && response.data.membres) {
            setMembers(response.data.membres.map(m => {
              const nom = m.nom || '';
              const prenom = m.prenom || '';
              const initials = ((nom[0] || '') + (prenom[0] || '')).toUpperCase() || 'U';
              return {
                id: m.id,
                name: nom + ' ' + prenom,
                role: m.type_utilisateur || "Membre",
                initials: initials,
                bgColor: "#185fa5"
              };
            }));
          }
        }
      } catch (e) {
        console.error("Error fetching members", e);
      }
    };

    Promise.all([fetchMetrics, fetchMembers()]).then(([res]) => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching overview metrics:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <ProjectLayout activeTab="overview">
        <div className="overview-container scroll" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Chargement des données du tableau de bord...</p>
        </div>
      </ProjectLayout>
    );
  }

  // Extract metrics
  const metrics = {
    totalIssues: data.totalIssues || 0,
    completed: data.completed || 0,
    inProgress: data.inProgress || 0,
    overdue: data.overdue || 0
  };

  const activeSprintSummary = data.activeSprintSummary || {
    sprintName: "Aucun sprint actif",
    startDate: "N/A",
    endDate: "N/A",
    daysRemaining: 0,
    totalCompleted: 0,
    totalIssues: 0,
    distribution: { todo: 0, inProgress: 0, review: 0, done: 0 }
  };

  const { sprintName, startDate, endDate, daysRemaining, distribution, totalCompleted, totalIssues } = activeSprintSummary;
  const progressPercent = totalIssues === 0 ? 0 : Math.round((totalCompleted / totalIssues) * 100);

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
              {metrics.totalIssues > 0 ? Math.round((metrics.completed / metrics.totalIssues) * 100) : 0}% du total
            </span>
          </div>
          <div className="metric-card">
            <h3 className="metric-title">En cours</h3>
            <p className="metric-value">{metrics.inProgress}</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-title">En retard</h3>
            <p className={`metric-value ${metrics.overdue > 0 ? "text-danger" : ""}`}>
              {metrics.overdue}
            </p>
          </div>
        </section>

        {/* SECTION 3 - Sprint actif */}
        <section className="overview-section active-sprint-section">
          <div className="sprint-card-header">
            <div>
              <h2 className="section-title">Sprint actif</h2>
              <h3 className="sprint-name">{sprintName}</h3>
              <p className="sprint-dates">{startDate} — {endDate}</p>
            </div>
            <div className="sprint-countdown">J-{daysRemaining}</div>
          </div>
          
          <div className="sprint-progress-block">
            <div className="sprint-stats-header">
              <span className="stat-text">Progression</span>
              <span className="stat-ratio">{totalCompleted} / {totalIssues} issues terminées</span>
            </div>
            <div className="pbar-wrap overview-pbar">
                <div className="pbar-bg">
                    <div className="pbar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
            <div className="sprint-distribution">
              <span className="dist-item"><span className="dot dot-todo"></span> À faire ({distribution.todo})</span>
              <span className="dist-item"><span className="dot dot-in-progress"></span> En cours ({distribution.inProgress})</span>
              <span className="dist-item"><span className="dot dot-review"></span> En revue ({distribution.review})</span>
              <span className="dist-item"><span className="dot dot-done"></span> Terminé ({distribution.done})</span>
            </div>
          </div>
          
          <div className="sprint-card-footer">
            <Link to="/board" style={{ textDecoration: 'none' }}>
              <ActionBtn variant="primary" size="md">Voir le board</ActionBtn>
            </Link>
          </div>
        </section>

        {/* SECTION 4 - Répartition par type et priorité */}
        <section className="overview-section breakdown-section">
          <div className="breakdown-card">
            <h2 className="section-title">Répartition par type</h2>
            <div className="breakdown-list">
              {byType.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Aucun ticket existant</p>
              ) : (
                byType.map((item, idx) => (
                  <div key={idx} className="breakdown-row">
                    <span className="breakdown-label">{item.type}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${metrics.totalIssues > 0 ? (item.count / metrics.totalIssues) * 100 : 0}%`, backgroundColor: item.color }}></div>
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
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Aucun ticket existant</p>
              ) : (
                byPriority.map((item, idx) => (
                  <div key={idx} className="breakdown-row">
                    <span className="breakdown-label">{item.priority}</span>
                    <div className="breakdown-bar-wrap">
                      <div className="breakdown-bar" style={{ width: `${metrics.totalIssues > 0 ? (item.count / metrics.totalIssues) * 100 : 0}%`, backgroundColor: item.color }}></div>
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
              {fallbackActivity.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-avatar" style={{ backgroundColor: event.bgColor }}>
                    {event.initials}
                  </div>
                  <div className="timeline-content">
                    <p className="timeline-text">
                      <span className="timeline-name">{event.name}</span> {event.action}{" "}
                      <span className="timeline-issue">{event.issueName}</span>
                      {event.targetState && ` vers ${event.targetState}`}
                    </p>
                    <span className="timeline-time">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overview-section members-section">
            <div className="members-header">
              <h2 className="section-title">Membres du projet</h2>
              <Link to="/settings" style={{ textDecoration: 'none' }}>
                <button className="btn-manage-members">Gérer</button>
              </Link>
            </div>
            <div className="members-grid">
              {(members.length > 0 ? members : fallbackMembers).map((m) => (
                <div key={m.id} className="member-card">
                  <div className="member-card-avatar" style={{ backgroundColor: m.bgColor }}>
                    {m.initials}
                  </div>
                  <div className="member-card-info">
                    <h4 className="member-card-name">{m.name}</h4>
                    <p className="member-card-role">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </ProjectLayout>
  );
}
