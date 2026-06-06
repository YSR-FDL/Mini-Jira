import React, { useState, useEffect } from "react";
import { members } from "../../data/mockOverviewData";
import { projectService } from "../../services/projectService";
import "../../styles/Layout/ProjectHeader.css";

export default function ProjectHeader() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, using hardcoded projectId 1
    projectService.getProjectById(1).then(data => {
      setProject(data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading project header:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !project) {
    return (
      <div className="project-header-container" style={{ padding: '24px' }}>
        Chargement de l'en-tête du projet...
      </div>
    );
  }

  return (
    <div className="project-header-container">
      <div className="project-header-main">
        {/* Left: Icon, Title, Key, Description */}
        <div className="project-header-left">
          <div className="project-icon">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div className="project-header-text">
            <div className="project-header-title-row">
              <h1 className="project-name">{project.nomProjet}</h1>
              <span className="project-key">{project.cle || `#PROJ${project.idProject}`}</span>
            </div>
            <p className="project-description">Un outil de gestion de projet minimaliste pour le suivi des tâches et des sprints.</p>
          </div>
        </div>

        {/* Right: Status, Dates, Members */}
        <div className="project-header-right">
          <div className="project-meta-top">
            <span className="project-status-badge">{project.isArchived ? "Archivé" : "Actif"}</span>
            <span className="project-dates">
              <span className="material-symbols-outlined">calendar_today</span>
              {project.dateCreation} — En cours
            </span>
          </div>
          <div className="project-members">
            {members.map((m) => (
              <div
                key={m.id}
                className="member-avatar"
                style={{ backgroundColor: m.bgColor, color: m.textColor }}
                title={`${m.name} - ${m.role}`}
              >
                {m.initials}
              </div>
            ))}
            <button className="add-member-btn" title="Ajouter un membre">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
