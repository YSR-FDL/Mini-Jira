import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { projectService } from "../../services/projectService";
import axios from "axios";
import "../../styles/Layout/ProjectHeader.css";

export default function ProjectHeader() {
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const rawId = localStorage.getItem("selectedProjectId");
  const projectId =
    rawId && rawId !== "undefined" && rawId !== "null"
      ? parseInt(rawId, 10)
      : 1;
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const loadProjectData = async () => {
    try {
      const data = await projectService.getProjectById(projectId);
      if (data) {
        setProject(data);
        if (data.idTeam > 0) {
          const teamRes = await axios.get(
            `http://localhost:8080/GetTeam?id=${data.idTeam}`,
          );
          setTeam(teamRes.data);
        } else {
          setTeam(null);
        }
      }
    } catch (err) {
      console.error("Error loading project header:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const fetchUserTeams = async () => {
    try {
      const response = await axios.post("http://localhost:8080/GetUserTeams", {
        id: loggedInUser.id,
        type_utilisateur: loggedInUser.type_utilisateur,
      });
      setAvailableTeams(response.data);
    } catch (error) {
      console.error("Error fetching user teams:", error);
    }
  };

  const handleOpenAssignModal = () => {
    fetchUserTeams();
    setShowAssignModal(true);
  };

  const handleAssignTeam = async () => {
    if (!selectedTeamId) {
      alert("Veuillez sélectionner une équipe.");
      return;
    }
    try {
      const success = await projectService.assignTeamToProject(
        project.idProject,
        parseInt(selectedTeamId, 10),
      );
      if (success) {
        setShowAssignModal(false);
        // Reload details
        loadProjectData();
      } else {
        alert("Erreur lors de l'association de l'équipe.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de communication avec le serveur.");
    }
  };

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

  if (loading || !project) {
    return (
      <div className="project-header-container" style={{ padding: "24px" }}>
        Chargement de l'en-tête du projet...
      </div>
    );
  }

  const isSM =
    loggedInUser &&
    (loggedInUser.id === project.idSM ||
      loggedInUser.id === project.idCreateur);
  const membersList = team && team.membres ? team.membres : [];

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
              <span className="project-key">
                {project.cle || `#PROJ${project.idProject}`}
              </span>
            </div>
            <p className="project-description">
              Un outil de gestion de projet minimaliste pour le suivi des tâches
              et des sprints.
            </p>
          </div>
        </div>

        {/* Right: Status, Dates, Members */}
        <div className="project-header-right">
          <div className="project-meta-top">
            <span className="project-status-badge">
              {project.isArchived ? "Archivé" : "Actif"}
            </span>
            <span className="project-dates">
              <span className="material-symbols-outlined">calendar_today</span>
              {project.dateCreation} — En cours
            </span>
          </div>
          <div className="project-members">
            {membersList.length > 0 ? (
              membersList.map((m) => {
                const colors = getAvatarColor(m.nom);
                const initials =
                  `${m.nom[0] || ""}${m.prenom[0] || ""}`.toUpperCase();
                return (
                  <div
                    key={m.id}
                    className="member-avatar"
                    style={{ backgroundColor: colors.bg, color: colors.color }}
                    title={`${m.nom} ${m.prenom} (${m.email})`}
                  >
                    {initials}
                  </div>
                );
              })
            ) : (
              <span
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-soft)",
                  marginRight: "8px",
                }}
              >
                Aucune équipe
              </span>
            )}

            {isSM && (
              <button
                className="add-member-btn"
                title="Associer une équipe"
                onClick={handleOpenAssignModal}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showAssignModal &&
        ReactDOM.createPortal(
          <div className="assign-team-modal-overlay">
            <div className="assign-team-modal">
              <h3>Associer une équipe au projet</h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-light)",
                  marginBottom: "16px",
                }}
              >
                Choisissez l'équipe Scrum pour ce projet. Les membres de
                l'équipe seront autorisés à collaborer sur les tâches.
              </p>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-mid)",
                  }}
                >
                  SÉLECTIONNER L'ÉQUIPE
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                  }}
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">-- Choisir une équipe --</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onClick={() => setShowAssignModal(false)}
                >
                  Annuler
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--blue-primary)",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                  onClick={handleAssignTeam}
                >
                  Associer
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
