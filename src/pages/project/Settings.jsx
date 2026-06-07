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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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

  const isCreator = loggedInUser && loggedInUser.id === project.idCreateur;
  const creatorUser = users.find((u) => u.id === project.idCreateur);
  const creatorName = creatorUser
    ? `${creatorUser.nom} ${creatorUser.prenom} (${creatorUser.email})`
    : `Utilisateur #${project.idCreateur}`;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isCreator) {
      setErrorMsg("Seul le créateur du projet peut modifier les paramètres.");
      return;
    }
    setIsSaving(true);
    setMessage("");
    setErrorMsg("");

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
    if (
      !window.confirm(
        "Attention: Cette action est irréversible et supprimera définitivement le projet ainsi que ses sprints et tâches associées. Confirmer ?",
      )
    )
      return;

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
              Gérez les détails, l'accès, les rôles Scrum et l'équipe assignée à
              votre projet.
            </p>
          </div>

          <form onSubmit={handleSave} className="settings-content">
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

            {/* 2. Accès & Rôles Clés */}
            <section className="settings-section">
              <h3 className="settings-section-title">
                <FiUsers /> Rôles & Responsabilités
              </h3>
              <p className="settings-section-subtitle">
                Définissez les rôles Scrum pour l'organisation du projet.
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
                <div className="form-group">
                  <label className="form-label">Product Owner (PO)</label>
                  <select
                    className="form-select"
                    value={project.idPO || project.idCreateur}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        idPO: parseInt(e.target.value, 10),
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
                <div className="form-group">
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
              </div>
            </section>

            {/* 3. L'Équipe */}
            <section className="settings-section">
              <h3 className="settings-section-title">
                <FiUsers /> Équipe & Collaborateurs
              </h3>
              <p className="settings-section-subtitle">
                Liste des membres de l'équipe assignée à ce projet.
              </p>

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
                  Aucune équipe assignée à ce projet. Associez une équipe en
                  cliquant sur le bouton "+" dans l'en-tête du projet.
                </div>
              )}
            </section>

            {isCreator && (
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
                <ActionBtn type="submit" variant="primary" disabled={isSaving}>
                  {isSaving
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </ActionBtn>
              </div>
            )}
          </form>

          {/* 4. Danger zone */}
          {isCreator && (
            <section
              className="settings-section danger-zone"
              style={{ marginTop: "-16px" }}
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
