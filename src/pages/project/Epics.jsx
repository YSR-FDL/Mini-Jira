import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProjectLayout from "../../components/layout/ProjectLayout";
import TaskDetailModal from "../../components/shared/TaskDetailModal";
import ActionBtn from "../../components/ui/ActionBtn";
import { taskService } from "../../services/taskService";
import { epicService } from "../../services/epicService";
import { sprintService } from "../../services/sprintService";
import { projectService } from "../../services/projectService";
import { FiChevronRight, FiChevronDown, FiPlus, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaBookmark, FaBug, FaTasks } from "react-icons/fa";
import "../../styles/Project/Epics.css";

const TYPE_ICON = {
  Story: <FaBookmark color="#579DFF" />,
  Feature: <FaBookmark color="#579DFF" />,
  Request: <FaTasks color="#4BCE97" />,
  Bug: <FaBug color="#F15B50" />,
};

const isDone = (status) => {
  const s = (status || "").toLowerCase();
  return /(done|termin|released|closed|ferm)/.test(s);
};

export default function Epics() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [columns, setColumns] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isPO, setIsPO] = useState(false);

  const [expanded, setExpanded] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Création d'epic
  const [isCreating, setIsCreating] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [newEpicDesc, setNewEpicDesc] = useState("");

  // Epics are owned by the Product Owner (SM/Dev are read-only on epics).
  const canManage = isPO;

  const getProjectId = () => {
    const rawId = localStorage.getItem("selectedProjectId");
    return rawId && rawId !== "undefined" && rawId !== "null"
      ? parseInt(rawId, 10)
      : 1;
  };

  const fetchData = useCallback(async () => {
    const projectId = getProjectId();
    try {
      const [tasksData, epicsData, projectData, sprintsData] =
        await Promise.all([
          taskService.getProjectTasks(projectId),
          epicService.getEpics(projectId),
          projectService.getProjectById(projectId),
          sprintService.getAll(projectId),
        ]);

      setAllTasks(tasksData);
      setEpics(epicsData);
      setProject(projectData);
      setSprints(sprintsData);

      if (projectData && projectData.etats) {
        setColumns(
          projectData.etats.map((etat) => ({
            id: etat,
            title: etat,
          })),
        );
      }

      if (projectData && projectData.idTeam > 0) {
        try {
          const teamRes = await axios.get(
            `http://localhost:8080/Backend_PFA/GetTeam?id=${projectData.idTeam}`,
          );
          setTeamMembers(teamRes.data?.membres || []);
        } catch (e) {
          setTeamMembers([]);
        }
      }

      const userString = localStorage.getItem("user");
      const loggedInUser = userString ? JSON.parse(userString) : null;
      const currentUserId = loggedInUser ? parseInt(loggedInUser.id, 10) : null;
      if (projectData && currentUserId) {
        setIsPO(parseInt(projectData.idPO, 10) === currentUserId);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des epics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stories sans epic, candidates à un rattachement
  const unassignedStories = allTasks.filter(
    (t) =>
      !t.parentId &&
      !(t.tags && t.tags[0] === "Epic") &&
      // exclut les epics eux-mêmes (présents dans allTasks)
      !epics.some((e) => e.id === t.id),
  );

  const toggle = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCreateEpic = async () => {
    if (!newEpicTitle.trim()) return;
    await taskService.createDetailedTask({
      title: newEpicTitle.trim(),
      description: newEpicDesc.trim(),
      tags: ["Epic"],
      sprintId: null,
      projectId: getProjectId(),
    });
    setNewEpicTitle("");
    setNewEpicDesc("");
    setIsCreating(false);
    fetchData();
  };

  const handleAttachStory = async (storyId, epicRawId) => {
    if (!storyId) return;
    await taskService.updateTask(storyId, { parentId: epicRawId });
    fetchData();
  };

  const handleDetachStory = async (storyId) => {
    await taskService.updateTask(storyId, { parentId: null });
    fetchData();
  };

  // Sauvegarde depuis le modal (auto-save d'un champ)
  const handleSaveTask = (updatedTask) => {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
    );
    taskService
      .updateTask(updatedTask.id, updatedTask)
      .then(() => fetchData())
      .catch((err) => console.error("Error updating task:", err));
  };

  const handleDeleteTask = (taskId) => {
    taskService
      .deleteTask(taskId)
      .then(() => {
        setSelectedTaskId(null);
        fetchData();
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  // Cherche une tâche (epic ou enfant) par son id pour alimenter le modal
  const findTask = (id) => {
    for (const e of epics) {
      if (e.id === id) return e;
      const child = e.children.find((c) => c.id === id);
      if (child) return child;
    }
    return allTasks.find((t) => t.id === id) || null;
  };

  const selectedTask = selectedTaskId ? findTask(selectedTaskId) : null;

  if (loading) {
    return (
      <ProjectLayout activeTab="epics">
        <div
          className="epics-container scroll"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <p style={{ color: "var(--text-light)" }}>Chargement des epics...</p>
        </div>
      </ProjectLayout>
    );
  }

  return (
    <ProjectLayout activeTab="epics">
      <div className="epics-container scroll">
        <div className="epics-header">
          <div>
            <h2 className="epics-title">Epics</h2>
            <p className="epics-subtitle">
              Regroupez vos stories sous des epics et suivez leur progression.
            </p>
          </div>
          {canManage && !isCreating && (
            <ActionBtn variant="primary" onClick={() => setIsCreating(true)}>
              <FiPlus style={{ marginRight: 6 }} /> Nouvel epic
            </ActionBtn>
          )}
        </div>

        {/* Formulaire de création */}
        {isCreating && (
          <div className="epic-create-card">
            <div className="epic-create-row">
              <input
                className="ui-input"
                placeholder="Titre de l'epic..."
                value={newEpicTitle}
                onChange={(e) => setNewEpicTitle(e.target.value)}
                autoFocus
              />
            </div>
            <textarea
              className="ui-input scroll"
              placeholder="Description (optionnel)..."
              value={newEpicDesc}
              onChange={(e) => setNewEpicDesc(e.target.value)}
              style={{ minHeight: 70, resize: "vertical" }}
            />
            <div className="epic-create-actions">
              <ActionBtn
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewEpicTitle("");
                  setNewEpicDesc("");
                }}
              >
                Annuler
              </ActionBtn>
              <ActionBtn variant="primary" onClick={handleCreateEpic}>
                Créer l'epic
              </ActionBtn>
            </div>
          </div>
        )}

        {epics.length === 0 ? (
          <div className="epics-empty">
            <FaBookmark size={32} color="var(--text-faint)" />
            <p>Aucun epic pour ce projet.</p>
            {canManage && (
              <span>Créez-en un pour organiser vos stories.</span>
            )}
          </div>
        ) : (
          <div className="epics-list">
            {epics.map((epic) => {
              const pct =
                epic.childCount > 0
                  ? Math.round((epic.doneCount / epic.childCount) * 100)
                  : 0;
              const isOpen = !!expanded[epic.id];
              return (
                <div key={epic.id} className="epic-card">
                  <div className="epic-card-head">
                    <button
                      className="epic-toggle"
                      onClick={() => toggle(epic.id)}
                      title={isOpen ? "Réduire" : "Développer"}
                    >
                      {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                    </button>

                    <div className="epic-main" onClick={() => setSelectedTaskId(epic.id)}>
                      <div className="epic-badge">EPIC</div>
                      <span className="epic-name">{epic.title}</span>
                      <span className="epic-id">{epic.id}</span>
                    </div>

                    <div className="epic-stats">
                      <span className="epic-stat">
                        {epic.doneCount}/{epic.childCount} stories
                      </span>
                      <span className="epic-stat epic-stat-pts">
                        {epic.donePoints}/{epic.totalPoints} pts
                      </span>
                      {canManage && (
                        <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                          <button className="epic-detach" onClick={() => setSelectedTaskId(epic.id)} title="Modifier l'epic">
                            <FiEdit2 size={14} color="var(--text-light)"/>
                          </button>
                          <button className="epic-detach" onClick={() => handleDeleteTask(epic.id)} title="Supprimer l'epic">
                            <FiTrash2 size={14} color="var(--text-light)" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="epic-progress">
                    <div className="epic-progress-bar">
                      <div
                        className="epic-progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="epic-progress-pct">{pct}%</span>
                  </div>

                  {isOpen && (
                    <div className="epic-children">
                      {epic.children.length === 0 ? (
                        <p className="epic-no-child">
                          Aucune story rattachée.
                        </p>
                      ) : (
                        epic.children.map((c) => (
                          <div
                            key={c.id}
                            className={`epic-child-row ${isDone(c.status) ? "is-done" : ""}`}
                          >
                            <span className="epic-child-type">
                              {TYPE_ICON[c.tags?.[0]] || TYPE_ICON.Story}
                            </span>
                            <span
                              className="epic-child-title"
                              onClick={() => setSelectedTaskId(c.id)}
                            >
                              <span className="epic-child-id">{c.id}</span>
                              {c.title}
                            </span>
                            <span className="epic-child-status">
                              {c.status}
                            </span>
                            <span className="epic-child-pts">
                              {c.points || 0} pts
                            </span>
                            {c.assignee ? (
                              <span
                                className="epic-avatar"
                                style={{ background: c.assignee.bgColor }}
                                title={c.assignee.name}
                              >
                                {c.assignee.initials}
                              </span>
                            ) : (
                              <span className="epic-avatar epic-avatar-empty">
                                ?
                              </span>
                            )}
                            {canManage && (
                              <button
                                className="epic-detach"
                                title="Détacher de l'epic"
                                onClick={() => handleDetachStory(c.id)}
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                        ))
                      )}

                      {/* Rattacher une story existante */}
                      {canManage && unassignedStories.length > 0 && (
                        <div className="epic-attach-row">
                          <select
                            className="ui-input"
                            defaultValue=""
                            onChange={(e) => {
                              handleAttachStory(e.target.value, epic.rawId);
                              e.target.value = "";
                            }}
                          >
                            <option value="" disabled>
                              + Rattacher une story...
                            </option>
                            {unassignedStories.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.id} — {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          columns={columns}
          project={project}
          teamMembers={teamMembers}
          sprints={sprints}
        />
      )}
    </ProjectLayout>
  );
}
