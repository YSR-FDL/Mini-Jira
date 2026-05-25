import React from "react";
import ProjectLayout from "../../components/layout/ProjectLayout";
import { Link } from "react-router-dom";
import { metrics, activeSprintSummary, taskBreakdown, recentActivity } from "../../data/mockOverviewData";
import "../../styles/Project/Overview.css";
import ActionBtn from "../../components/ui/ActionBtn";

export default function Overview() {
  // Helpers
  const { sprintName, startDate, endDate, daysRemaining, distribution, totalCompleted, totalIssues } = activeSprintSummary;
  const progressPercent = totalIssues === 0 ? 0 : Math.round((totalCompleted / totalIssues) * 100);

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
              {Math.round((metrics.completed / metrics.totalIssues) * 100)}% du total
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
            {/* Same progress bar structure as in Sprints */}
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
              {taskBreakdown.byType.map((item, idx) => (
                <div key={idx} className="breakdown-row">
                  <span className="breakdown-label">{item.type}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${(item.count / metrics.totalIssues) * 100}%`, backgroundColor: item.color }}></div>
                  </div>
                  <span className="breakdown-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-card">
            <h2 className="section-title">Répartition par priorité</h2>
            <div className="breakdown-list">
              {taskBreakdown.byPriority.map((item, idx) => (
                <div key={idx} className="breakdown-row">
                  <span className="breakdown-label">{item.priority}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${(item.count / metrics.totalIssues) * 100}%`, backgroundColor: item.color }}></div>
                  </div>
                  <span className="breakdown-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 & 6 - Activité récente et Membres */}
        <div className="overview-bottom-grid">
          
          <section className="overview-section activity-section">
            <h2 className="section-title">Activité récente</h2>
            <div className="activity-timeline">
              {recentActivity.map((event) => (
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
              {/* projectInfo members imported above are handled in ProjectHeader, but we can reuse members here */}
              {require("../../data/mockOverviewData").members.map((m) => (
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
