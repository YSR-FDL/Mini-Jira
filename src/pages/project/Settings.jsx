import React, { useState, useEffect } from "react";
import ProjectLayout from "../../components/layout/ProjectLayout";
import ActionBtn from "../../components/ui/ActionBtn";
import { projectService } from "../../services/projectService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/Project/Settings.css";
import {
  FiSettings,
  FiUsers,
  FiAlertTriangle,
  FiTrash2,
  FiArchive,
} from "react-icons/fi";

export default function Settings() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [team, setTeam] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");

  const rawId = localStorage.getItem("selectedProjectId");
  const projectId =
    rawId && rawId !== "undefined" && rawId !== "null"
      ? parseInt(rawId, 10)
      : 1;
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch project
      const projData = await projectService.getProjectById(projectId);
      if (!projData) {
        setErrorMsg("Impossible de charger le projet.");
        setLoading(false);
        return;
      }
      setProject(projData);

      // Fetch all users
      const usersRes = await axios.get("http://localhost:8080/Backend_PFA/GetAllUsers");
      setUsers(usersRes.data);

      // Fetch team if assigned
      if (projData.idTeam > 0) {
        const teamRes = await axios.get(
          `http://localhost:8080/Backend_PFA/GetTeam?id=${projData.idTeam}`,
        );
        setTeam(teamRes.data);
      } else {
        setTeam(null);
      }

      // Fetch available teams
      if (loggedInUser) {
        const teamsRes = await axios.get("http://localhost:8080/Backend_PFA/GetAllTeams");
        setAvailableTeams(teamsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading settings data:", err);
      setErrorMsg("Erreur de chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    if (project && loggedInUser) {
      const currentUserId = parseInt(loggedInUser.id, 10);
      const creator = parseInt(project.idCreateur, 10) === currentUserId;
      if (!creator) {
        setActiveSettingsTab("acces");
      }
    }
  }, [project]);

  if (loading) {
    return (
      <ProjectLayout activeTab="settings" projectName="Chargement...">
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "var(--text-soft)",
          }}
        >
          Chargement des paramètres du projet...
        </div>
      </ProjectLayout>
    );
  }

  if (errorMsg || !project) {
    return (
      <ProjectLayout activeTab="settings" projectName="Erreur">
        <div
          style={{ padding: "32px", textAlign: "center", color: "var(--red)" }}
        >
          {errorMsg || "Projet non trouvé."}
        </div>
      </ProjectLayout>
    );
  }

  const currentUserId = loggedInUser ? parseInt(loggedInUser.id, 10) : null;
  const isCreator = loggedInUser && parseInt(project.idCreateur, 10) === currentUserId;
  const isSM = loggedInUser && parseInt(project.idSM, 10) === currentUserId;

  if (!isCreator && !isSM) {
    return (
      <ProjectLayout activeTab="settings" projectName="Accès Refusé">
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--red)",
            fontWeight: "bold",
            fontSize: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <FiAlertTriangle size={48} color="var(--red)" />
          <span>Accès refusé : Seuls l'administrateur (créateur) et le Scrum Master peuvent accéder aux paramètres de ce projet.</span>
        </div>
      </ProjectLayout>
    );
  }

  const creatorUser = users.find((u) => u.id === project.idCreateur);
  const creatorName = creatorUser
    ? `${creatorUser.nom} ${creatorUser.prenom} (${creatorUser.email})`
    : `Utilisateur #${project.idCreateur}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMsg("");

    if (!isCreator) {
      setErrorMsg("Seul l'administrateur du projet peut modifier les paramètres.");
      setIsSaving(false);
      return;
    }

    try {
      const updated = await projectService.updateProject({
        idProject: project.idProject,
        nomProjet: project.nomProjet,
        cle: project.cle,
        idSM: project.idSM,
        idPO: project.idPO,
        idCreateur: project.idCreateur,
        idTeam: project.idTeam,
      });
      if (updated) {
        setMessage("Paramètres mis à jour avec succès.");
        // Refresh page data
        loadData();
      } else {
        setErrorMsg("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de la mise à jour.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!isCreator) {
      alert("Seul le créateur du projet peut archiver le projet.");
      return;
    }
    const confirmText = project.isArchived ? "Désarchiver" : "Archiver";
    if (
      !window.confirm(
        `Voulez-vous vraiment ${confirmText.toLowerCase()} ce projet ?`,
      )
    )
      return;

    try {
      const success = await projectService.archiveProject(
        project.idProject,
        !project.isArchived,
      );
      if (success) {
        alert(
          `Projet ${project.isArchived ? "désarchivé" : "archivé"} avec succès.`,
        );
        loadData();
      } else {
        alert("Erreur lors de l'archivage.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de communication avec le serveur.");
    }
  };

  const handleDelete = async () => {
    if (!isCreator) {
      alert("Seul le créateur du projet peut supprimer le projet.");
      return;
    }
    const confirmation = window.prompt(
      `Attention: Cette action est irréversible et supprimera définitivement le projet. Pour confirmer, veuillez saisir le nom exact du projet : "${project.nomProjet}"`
    );
    if (confirmation !== project.nomProjet) {
      alert("Le nom saisi ne correspond pas. Suppression annulée.");
      return;
    }

    try {
      const success = await projectService.deleteProject(project.idProject);
      if (success) {
        alert("Projet supprimé avec succès.");
        navigate("/projects");
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de communication avec le serveur.");
    }
  };

  return (
    <ProjectLayout activeTab="settings" projectName={project.nomProjet}>
      <div className="settings-container scroll">
        <div className="settings-content">
          <div className="settings-header">
            <h2 className="settings-title">Paramètres du Projet</h2>
            <p className="settings-description">
              Gerez les details, l'acces, les roles Scrum et l'equipe assignee a
              votre projet.
            </p>
          </div>

          {/* Tab Switcher: visible to the creator (Admin) and SM. Only the
              creator can edit; SM sees the settings in read-only. */}
          {(isCreator || isSM) && (
            <div className="settings-tabs" style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
              <button
                type="button"
                className={`settings-tab-btn ${activeSettingsTab === "general" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("general")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeSettingsTab === "general" ? "var(--color-primary-blue)" : "var(--color-text-secondary)",
                  borderBottom: activeSettingsTab === "general" ? "2px solid var(--color-primary-blue)" : "none",
                  cursor: "pointer"
                }}
              >
                Général
              </button>
              <button
                type="button"
                className={`settings-tab-btn ${activeSettingsTab === "acces" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("acces")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeSettingsTab === "acces" ? "var(--color-primary-blue)" : "var(--color-text-secondary)",
                  borderBottom: activeSettingsTab === "acces" ? "2px solid var(--color-primary-blue)" : "none",
                  cursor: "pointer"
                }}
              >
                Accès & membres
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className="settings-content">
            {/* GENERAL TAB CONTENT (editable by Admin/Creator, read-only for SM) */}
            {activeSettingsTab === "general" && (
              <>
                {/* 1. Informations Générales */}
                <section className="settings-section">
                  <h3 className="settings-section-title">
                    <FiSettings /> Informations générales
                  </h3>
                  <p className="settings-section-subtitle">
                    Identité de base du projet.
                  </p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nom du projet</label>
                      <input
                        className="form-input"
                        type="text"
                        value={project.nomProjet}
                        onChange={(e) =>
                          setProject((prev) => ({
                            ...prev,
                            nomProjet: e.target.value,
                          }))
                        }
                        required
                        disabled={!isCreator}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Clé du projet</label>
                      <input
                        className="form-input"
                        type="text"
                        value={project.cle}
                        onChange={(e) =>
                          setProject((prev) => ({ ...prev, cle: e.target.value }))
                        }
                        required
                        maxLength={10}
                        disabled={!isCreator}
                      />
                    </div>
                  </div>
                </section>


                {/* Save Footer for General Tab */}
                <div className="settings-footer">
                  {message && <span className="save-message">{message}</span>}
                  {errorMsg && (
                    <span
                      className="save-message"
                      style={{ color: "var(--red)" }}
                    >
                      {errorMsg}
                    </span>
                  )}
                  {isCreator && (
                    <ActionBtn type="submit" variant="primary" disabled={isSaving}>
                      {isSaving
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                    </ActionBtn>
                  )}
                </div>
              </>
            )}

            {/* ACCES & MEMBRES TAB CONTENT (editable by Admin/Creator, read-only for SM) */}
            {activeSettingsTab === "acces" && (
              <>
                {/* 1. Rôles (SM, PO, Créateur) */}
                <section className="settings-section">
                  <h3 className="settings-section-title">
                    <FiUsers /> Rôles & Responsabilités
                  </h3>
                  <p className="settings-section-subtitle">
                    Définissez les différents rôles organisationnels du projet.
                  </p>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        Chef de projet (Créateur)
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        value={creatorName}
                        disabled
                        style={{
                          backgroundColor: "var(--border-light)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label className="form-label">Scrum Master (SM)</label>
                      <select
                        className="form-select"
                        value={project.idSM || project.idCreateur}
                        onChange={(e) =>
                          setProject((prev) => ({
                            ...prev,
                            idSM: parseInt(e.target.value, 10),
                          }))
                        }
                        disabled={!isCreator}
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nom} {u.prenom} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label className="form-label">Product Owner (PO)</label>
                      <select
                        className="form-select"
                        value={project.idPO || ""}
                        onChange={(e) =>
                          setProject((prev) => ({
                            ...prev,
                            idPO: parseInt(e.target.value, 10),
                          }))
                        }
                        disabled={!isCreator}
                      >
                        <option value="">-- Choisir un Product Owner --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nom} {u.prenom} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* 2. L'Équipe */}
                <section className="settings-section">
                  <h3 className="settings-section-title">
                    <FiUsers /> Équipe & Collaborateurs
                  </h3>
                  <p className="settings-section-subtitle">
                    Liste des membres de l'équipe assignée à ce projet.
                  </p>

                  {(isCreator || isSM) && (
                    <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-mid)" }}>Associer/Changer d'équipe :</label>
                      <select
                        className="form-select"
                        style={{ width: "auto", minWidth: "220px", padding: "6px 12px" }}
                        value={project.idTeam || ""}
                        onChange={async (e) => {
                          const newTeamId = e.target.value ? parseInt(e.target.value, 10) : 0;
                          try {
                            const success = await projectService.assignTeamToProject(project.idProject, newTeamId);
                            if (success) {
                              setProject(prev => ({ ...prev, idTeam: newTeamId }));
                              loadData();
                            } else {
                              alert("Erreur lors de l'association de l'équipe.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Erreur de communication avec le serveur.");
                          }
                        }}
                      >
                        <option value="">-- Choisir une équipe --</option>
                        {availableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {team ? (
                    <div className="members-list">
                      <div
                        style={{
                          marginBottom: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        Équipe :{" "}
                        <span style={{ color: "var(--blue)" }}>{team.nom}</span> (
                        {team.objectif || "Pas d'objectif spécifié"})
                      </div>
                      {team.membres && team.membres.length > 0 ? (
                        team.membres.map((member) => {
                          const initials =
                            `${member.nom[0] || ""}${member.prenom[0] || ""}`.toUpperCase();

                          // Calculate role:
                          let role = "Développeur";
                          if (member.id === project.idSM) {
                            role = "Scrum Master (SM)";
                          } else if (member.id === project.idPO) {
                            role = "Product Owner (PO)";
                          } else if (member.id === project.idCreateur) {
                            role = "Créateur / Chef de projet";
                          }

                          return (
                            <div key={member.id} className="member-item">
                              <div className="member-info">
                                <div className="member-avatar">{initials}</div>
                                <div>
                                  <div className="member-name">
                                    {member.nom} {member.prenom}
                                  </div>
                                  <div
                                    className="member-role"
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-soft)",
                                    }}
                                  >
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                  backgroundColor: role.includes("SM")
                                    ? "#E3FCEF"
                                    : role.includes("PO")
                                      ? "#FFF3E0"
                                      : "#EAF2FF",
                                  color: role.includes("SM")
                                    ? "#006644"
                                    : role.includes("PO")
                                      ? "#B25000"
                                      : "#0052CC",
                                }}
                              >
                                {role}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          style={{ fontSize: "14px", color: "var(--text-soft)" }}
                        >
                          Cette équipe n'a pas encore de membres.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        border: "1px dashed var(--border)",
                        borderRadius: "8px",
                        textAlign: "center",
                        color: "var(--text-soft)",
                      }}
                    >
                      Aucune équipe de développement n'est assignée à ce projet. Sélectionnez-en une ci-dessus.
                    </div>
                  )}
                </section>

                {/* Save Footer for Access Tab */}
                <div className="settings-footer">
                  {message && <span className="save-message">{message}</span>}
                  {errorMsg && (
                    <span
                      className="save-message"
                      style={{ color: "var(--red)" }}
                    >
                      {errorMsg}
                    </span>
                  )}
                  {isCreator && (
                    <ActionBtn type="submit" variant="primary" disabled={isSaving}>
                      {isSaving
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                    </ActionBtn>
                  )}
                </div>
              </>
            )}
          </form>

          {/* DANGER ZONE (Visible to Creator only, rendered on general tab) */}
          {activeSettingsTab === "general" && isCreator && (
            <section
              className="settings-section danger-zone"
              style={{ marginTop: "24px" }}
            >
              <h3 className="settings-section-title">
                <FiAlertTriangle /> Danger Zone
              </h3>
              <p
                className="settings-section-subtitle"
                style={{ color: "var(--red-text)" }}
              >
                Actions irréversibles. Soyez prudent.
              </p>

              <div className="danger-action-row">
                <div className="danger-action-info">
                  <span className="danger-action-title">
                    {project.isArchived
                      ? "Désarchiver le projet"
                      : "Archiver le projet"}
                  </span>
                  <span className="danger-action-desc">
                    {project.isArchived
                      ? "Réactiver le projet pour permettre des modifications."
                      : "Le projet sera en lecture seule et n'apparaîtra plus dans les tableaux actifs."}
                  </span>
                </div>
                <ActionBtn
                  type="button"
                  variant="danger"
                  onClick={handleArchive}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FiArchive />{" "}
                  {project.isArchived ? "Désarchiver" : "Archiver"}
                </ActionBtn>
              </div>

              <div className="danger-action-row">
                <div className="danger-action-info">
                  <span className="danger-action-title">
                    Supprimer le projet
                  </span>
                  <span className="danger-action-desc">
                    Toutes les données, tâches et configurations seront
                    définitivement perdues.
                  </span>
                </div>
                <ActionBtn
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FiTrash2 /> Supprimer
                </ActionBtn>
              </div>
            </section>
          )}
        </div>
      </div>
    </ProjectLayout>
  );
}
