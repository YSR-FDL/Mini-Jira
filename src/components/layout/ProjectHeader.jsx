import React from "react";
import { projectInfo, members } from "../../data/mockOverviewData";
import "../../styles/Layout/ProjectHeader.css";

export default function ProjectHeader() {
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
              <h1 className="project-name">{projectInfo.name}</h1>
              <span className="project-key">{projectInfo.key}</span>
            </div>
            <p className="project-description">{projectInfo.description}</p>
          </div>
        </div>

        {/* Right: Status, Dates, Members */}
        <div className="project-header-right">
          <div className="project-meta-top">
            <span className="project-status-badge">{projectInfo.status}</span>
            <span className="project-dates">
              <span className="material-symbols-outlined">calendar_today</span>
              {projectInfo.startDate} — {projectInfo.endDate}
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
