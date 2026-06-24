import React, { useState, useEffect, useRef } from "react";
import ActionBtn from "../ui/ActionBtn";
import StatusDropdown from "../ui/StatusDropdown";
import "../../styles/Shared/TaskDetailModal.css";
import { FiMoreHorizontal, FiX, FiAlignLeft, FiMessageSquare, FiTrash2, FiPlus, FiCheckSquare } from "react-icons/fi";
import { FaBug, FaTasks, FaBookmark } from "react-icons/fa";
import { epicService } from "../../services/epicService";
import { commentService } from "../../services/commentService";
import { taskService } from "../../services/taskService";
import { activityService } from "../../services/activityService";
import { resolveRoles, taskPermissions } from "../../services/roles";

const TYPE_OPTIONS = [
  {
    value: "Feature",
    label: "Feature",
    icon: <FaBookmark color="#579DFF" style={{ marginRight: "8px" }} />,
  },
  {
    value: "Bug",
    label: "Bug",
    icon: <FaBug color="#F15B50" style={{ marginRight: "8px" }} />,
  },
  {
    value: "Tech",
    label: "Tech",
    icon: <FaTasks color="#4BCE97" style={{ marginRight: "8px" }} />,
  },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Élevée" },
  { value: "critical", label: "Critique" },
];

const TaskDetailModal = ({ task, onClose, onOpenTask, onSave, onDelete, columns = [], project, teamMembers = [], sprints = [] }) => {
  const statusOptions =
    columns.length > 0
      ? columns.map((col) => {
          let colorClass = "dot-custom";
          if (col.id === "todo") colorClass = "dot-todo";
          else if (col.id === "in-progress" || col.id === "progress")
            colorClass = "dot-progress";
          else if (col.id === "review") colorClass = "dot-review";
          else if (col.id === "done") colorClass = "dot-done";
          return {
            value: col.id,
            label: col.title,
            colorClass,
          };
        })
      : [
          { value: "todo", label: "À Faire", colorClass: "dot-todo" },
          {
            value: "in-progress",
            label: "En Cours",
            colorClass: "dot-progress",
          },
          { value: "review", label: "En Revue", colorClass: "dot-review" },
          { value: "done", label: "Terminé", colorClass: "dot-done" },
        ];

  const [editedTask, setEditedTask] = useState({
    ...task,
    type: task.tags && task.tags.length > 0 ? task.tags[0] : "Feature",
  });
  const [isClosing, setIsClosing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Hiérarchie (epics) et commentaires
  const [epics, setEpics] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Sous-tâches
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("comments"); // "comments" or "history"
  const [showAllItems, setShowAllItems] = useState(false);

  // Livrable (lien GitHub) — pour les sous-tâches.
  const [deliverableLink, setDeliverableLink] = useState(task?.deliverableLink || "");
  const [deliverableError, setDeliverableError] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = loggedInUser ? parseInt(loggedInUser.id, 10) : null;

  const isEpic = /epic/i.test(editedTask.type || "");
  const isSubtask = /subtask/i.test(editedTask.type || "");
  // Une "story" est une issue standard : ni epic, ni sous-tâche.
  const isStory = !isEpic && !isSubtask;

  // Statuts extrêmes du workflow projet (1re / dernière colonne), utilisés pour
  // cocher/décocher une sous-tâche.
  const todoStatus = statusOptions[0]?.value || "todo";
  const doneStatus = statusOptions[statusOptions.length - 1]?.value || "done";
  const isStatusDone = (status) => {
    const s = (status || "").toLowerCase();
    return (
      /(done|termin|released|closed|ferm)/.test(s) || status === doneStatus
    );
  };

  // Centralised RBAC (mirrors backend utils.Rbac): controls appear per role.
  const roles = resolveRoles(project, teamMembers, currentUserId);
  const perms = taskPermissions(roles, editedTask);
  const isPO = roles.isPO;
  const isSM = roles.isSM;

  const canEditTitle = perms.canEditTitle;
  const canEditType = perms.canEditType;
  const canEditPriority = perms.canEditPriority;
  const canDelete = perms.canDelete;
  const canEditStatus = perms.canEditStatus;
  const canEditDescription = perms.canEditDescription;
  const canEditPoints = perms.canEditPoints;
  const canEditParent = perms.canEditParent;
  const canManageSubtasks = perms.canManageSubtasks; // créer / supprimer sous-tâches
  const canToggleSubtask = perms.canToggleSubtask;
  const canEditAssignee = perms.canEditAssignee;
  const canSubmitDeliverable = perms.canSubmitDeliverable;
  const canRejectDeliverable = perms.canRejectDeliverable;

  const assigneeOptions = (() => {
    if (perms.assigneeScope === "team") {
      return allUsers.filter(u => teamMembers.some(m => parseInt(m.id, 10) === parseInt(u.id, 10)));
    } else if (perms.assigneeScope === "self") {
      const selfUser = allUsers.find(u => parseInt(u.id, 10) === currentUserId);
      return selfUser ? [selfUser] : [];
    }
    return [];
  })();

  useEffect(() => {
    fetch("http://localhost:8080/Backend_PFA/GetAllUsers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllUsers(
            data.map((u) => {
              const fullName = `${u.prenom || ""} ${u.nom || ""}`.trim();
              const getInitials = (firstName, lastName) => {
                let initialsStr = "";
                if (firstName) initialsStr += firstName[0].toUpperCase();
                if (lastName) initialsStr += lastName[0].toUpperCase();
                if (!initialsStr) return "??";
                if (
                  initialsStr.length === 1 &&
                  firstName &&
                  firstName.length > 1
                ) {
                  initialsStr += firstName[1].toUpperCase();
                }
                return initialsStr;
              };
              const COLOR_PALETTE = [
                "#185fa5",
                "#ef9f27",
                "#10b981",
                "#8b5cf6",
                "#ec4899",
                "#f97316",
                "#06b6d4",
                "#dc2626",
                "#84cc16",
                "#6366f1",
                "#14b8a6",
                "#f43f5e",
              ];
              const color =
                COLOR_PALETTE[Math.abs(u.id) % COLOR_PALETTE.length];
              return {
                id: u.id,
                name: fullName,
                initials: getInitials(u.prenom, u.nom),
                bgColor: color,
                textColor: "#FFF",
              };
            }),
          );
        }
      })
      .catch((err) => console.error("Error fetching all users:", err));
  }, []);

  // Charge les epics du projet (pour le sélecteur de parent) et les
  // commentaires de la tâche courante.
  useEffect(() => {
    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;
    epicService
      .getEpics(projectId)
      .then(setEpics)
      .catch((err) => console.error("Error fetching epics:", err));
  }, []);

  useEffect(() => {
    if (task && task.id !== "NEW") {
      const rawId = parseInt(String(task.id).replace(/^[A-Z]+-/, ""), 10);
      commentService
        .getByTask(rawId)
        .then(setComments)
        .catch((err) => console.error("Error fetching comments:", err));
        
      activityService
        .getTaskActivities(rawId)
        .then(setActivities)
        .catch((err) => console.error("Error fetching activities:", err));
    }
  }, [task]);

  // Charge les sous-tâches (enfants) d'une story existante.
  useEffect(() => {
    if (task && task.id !== "NEW" && isStory) {
      epicService
        .getChildren(task.id)
        .then(setSubtasks)
        .catch((err) => console.error("Error fetching subtasks:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const refreshSubtasks = () => {
    epicService
      .getChildren(task.id)
      .then(setSubtasks)
      .catch((err) => console.error("Error refreshing subtasks:", err));
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const parentRawId = parseInt(String(task.id).replace(/^[A-Z]+-/, ""), 10);
    taskService
      .createDetailedTask({
        title: newSubtask.trim(),
        tags: ["Subtask"],
        parentId: parentRawId,
        sprintId: null,
        status: todoStatus,
      })
      .then(() => {
        setNewSubtask("");
        refreshSubtasks();
      })
      .catch((err) => console.error("Error adding subtask:", err));
  };

  const handleToggleSubtask = (st) => {
    const newStatus = isStatusDone(st.status) ? todoStatus : doneStatus;
    // Mise à jour optimiste
    setSubtasks((prev) =>
      prev.map((s) => (s.id === st.id ? { ...s, status: newStatus } : s)),
    );
    // updateTaskStatus (=> /MoveTask) ne modifie que le statut : pas de risque
    // d'écraser le type 'Subtask' ou l'assigné comme le ferait un updateTask partiel.
    taskService
      .updateTaskStatus(st.id, newStatus)
      .then(refreshSubtasks)
      .catch((err) => {
        console.error("Error toggling subtask:", err);
        refreshSubtasks();
      });
  };

  const handleDeleteSubtask = (subtaskId) => {
    taskService
      .deleteTask(subtaskId)
      .then(refreshSubtasks)
      .catch((err) => console.error("Error deleting subtask:", err));
  };

  // Dépôt du livrable (lien GitHub) d'une sous-tâche.
  const handleSubmitDeliverable = () => {
    const link = (deliverableLink || "").trim();
    if (link && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/.test(link)) {
      setDeliverableError("Veuillez saisir une URL GitHub valide.");
      return;
    }
    setDeliverableError("");
    taskService
      .submitDeliverable(task.id, link)
      .then(() => {
        setEditedTask((prev) => ({ ...prev, deliverableLink: link || null }));
      })
      .catch((err) => {
        console.error("Error submitting deliverable:", err);
        setDeliverableError("Échec de l'enregistrement du livrable.");
      });
  };

  const handleRejectDeliverable = () => {
    if (window.confirm("Êtes-vous sûr de vouloir rejeter et supprimer ce livrable ?")) {
      taskService
        .submitDeliverable(task.id, "")
        .then(() => {
          setEditedTask((prev) => ({ ...prev, deliverableLink: null }));
          setDeliverableLink("");
        })
        .catch((err) => console.error("Error rejecting deliverable:", err));
    }
  };

  const refreshComments = () => {
    commentService
      .getByTask(task.id)
      .then(setComments)
      .catch((err) => console.error("Error refreshing comments:", err));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    commentService
      .add({ taskId: task.id, authorId: currentUserId, contenu: newComment.trim() })
      .then(() => {
        setNewComment("");
        refreshComments();
      })
      .catch((err) => console.error("Error adding comment:", err));
  };

  const handleDeleteComment = (commentId) => {
    commentService
      .remove(commentId)
      .then(refreshComments)
      .catch((err) => console.error("Error deleting comment:", err));
  };

  const formatCommentDate = (raw) => {
    if (!raw) return "";
    const d = new Date(String(raw).replace(" ", "T"));
    if (isNaN(d.getTime())) return raw;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Refs for auto-focus
  const titleInputRef = useRef(null);
  const descInputRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDesc]);

  const requestClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (isClosing && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      requestClose();
    }
  };

  // Auto-save wrapper
  const saveChanges = (updatedTask) => {
    setEditedTask(updatedTask);
    // Only auto-save if it's an existing task
    if (task.id !== "NEW" && onSave) {
      onSave(updatedTask);
    }
  };

  const handleCreateNewTask = () => {
    if (!editedTask.title || !editedTask.title.trim()) {
      alert("Le titre du ticket ne peut pas être vide.");
      return;
    }
    if (onSave) {
      onSave({
        ...editedTask,
        tags: [editedTask.type || "Feature"],
      });
    }
  };

  const handleDeleteTask = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.",
      )
    ) {
      if (onDelete) {
        onDelete(editedTask.id);
      }
    }
  };

  // Field change handlers
  const handleFieldChange = (field, value) => {
    if (field === "type") {
      saveChanges({ ...editedTask, type: value, tags: [value] });
      return;
    }
    saveChanges({ ...editedTask, [field]: value });
  };

  const stopEditingTitle = () => {
    setIsEditingTitle(false);
    if (editedTask.title.trim() === "") {
      saveChanges({ ...editedTask, title: task.title });
    }
  };

  const stopEditingDesc = () => {
    setIsEditingDesc(false);
    // Persist the edited description (no-op for NEW tasks, which save on create).
    saveChanges(editedTask);
  };

  if (!task) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`modal-content ${isClosing ? "slide-down" : "slide-up"}`}>
        {/* HEADER */}
        <div className="modal-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Mini-Jira</span>
            <span>/</span>
            <span
              className="breadcrumb-item"
              style={{ color: "var(--color-text-primary)" }}
            >
              {editedTask.id}
            </span>
          </div>
          <div
            className="header-actions"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            {editedTask.id !== "NEW" && onDelete && canDelete && (
              <ActionBtn variant="danger" onClick={handleDeleteTask}>
                Supprimer
              </ActionBtn>
            )}
            <button
              className="close-btn"
              onClick={requestClose}
              type="button"
              title="Fermer (Esc)"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body-container">
          <div className="modal-body scroll">
            {/* LEFT COLUMN: Main Content */}
            <div className="left-column">
              {/* TITLE */}
              <div style={{ marginBottom: "32px" }}>
                {task.id === "NEW" ? (
                  <div className="form-group-task" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>TITRE</label>
                    <input
                      className="ui-input"
                      style={{ fontSize: "16px", fontWeight: "600", width: "100%", padding: "8px 12px" }}
                      value={editedTask.title}
                      placeholder="Saisir le titre du ticket..."
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, title: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  isEditingTitle && canEditTitle ? (
                    <input
                      ref={titleInputRef}
                      className="title-input"
                      value={editedTask.title}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, title: e.target.value })
                      }
                      onBlur={stopEditingTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          stopEditingTitle();
                        }
                      }}
                    />
                  ) : (
                    <div
                      className="inline-edit-container task-title"
                      onClick={() => { if (canEditTitle) setIsEditingTitle(true); }}
                      style={{ cursor: canEditTitle ? "pointer" : "default" }}
                    >
                      {editedTask.title || "Ticket sans titre"}
                    </div>
                  )
                )}
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "40px" }}>
                <h3 className="section-title">
                  <FiAlignLeft style={{ marginRight: "8px" }} /> Description
                </h3>
                {task.id === "NEW" ? (
                  <textarea
                    className="ui-input scroll"
                    style={{ width: "100%", minHeight: "120px", padding: "10px", resize: "vertical" }}
                    value={editedTask.description || ""}
                    placeholder="Ajoutez une description détaillée..."
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  isEditingDesc && canEditDescription ? (
                    <div>
                      <textarea
                        ref={descInputRef}
                        className="description-textarea scroll"
                        value={editedTask.description || ""}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            description: e.target.value,
                          })
                        }
                        placeholder="Ajoutez une description détaillée..."
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            stopEditingDesc();
                          }
                        }}
                      />
                      <div className="edit-actions">
                        <ActionBtn variant="primary" onClick={stopEditingDesc}>
                          Enregistrer
                        </ActionBtn>
                        <ActionBtn
                          variant="secondary"
                          onClick={() => {
                            setEditedTask({
                              ...editedTask,
                              description: task.description,
                            }); // revert
                            setIsEditingDesc(false);
                          }}
                        >
                          Annuler
                        </ActionBtn>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="inline-edit-container description-text"
                      onClick={() => { if (canEditDescription) setIsEditingDesc(true); }}
                      style={{ cursor: canEditDescription ? "pointer" : "default" }}
                    >
                      {editedTask.description ? (
                        editedTask.description
                      ) : (
                        <span className="description-placeholder">
                          Ajouter une description...
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
              {/* LIVRABLE (sous-tâches existantes — visible par tous, éditable par le dev propriétaire) */}
              {task.id !== "NEW" && isSubtask && (
                <div className="deliverable-section" style={{ marginBottom: "40px" }}>
                  <h3 className="section-title">
                    <svg style={{ marginRight: "8px", verticalAlign: "-2px" }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Livrable (lien GitHub)
                  </h3>
                  {canSubmitDeliverable ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          className="ui-input"
                          style={{ flex: 1, padding: "8px 12px" }}
                          type="url"
                          placeholder="https://github.com/utilisateur/depot..."
                          value={deliverableLink}
                          onChange={(e) => setDeliverableLink(e.target.value)}
                        />
                        <ActionBtn variant="primary" onClick={handleSubmitDeliverable}>
                          Déposer
                        </ActionBtn>
                      </div>
                      {editedTask.deliverableLink && (
                        <a
                          href={editedTask.deliverableLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--color-primary-blue)", wordBreak: "break-all", fontSize: "13px" }}
                        >
                          {editedTask.deliverableLink}
                        </a>
                      )}
                      {deliverableError && (
                        <span style={{ color: "var(--color-danger-red)", fontSize: "12px" }}>
                          {deliverableError}
                        </span>
                      )}
                    </div>
                  ) : editedTask.deliverableLink ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <a
                        href={editedTask.deliverableLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-primary-blue)", wordBreak: "break-all" }}
                      >
                        {editedTask.deliverableLink}
                      </a>
                      {canRejectDeliverable && (
                        <ActionBtn variant="danger" onClick={handleRejectDeliverable}>
                          Rejeter
                        </ActionBtn>
                      )}
                    </div>
                  ) : (
                    <span className="description-placeholder">Aucun livrable déposé.</span>
                  )}
                </div>
              )}

              {/* SUBTASKS (stories only, existing) */}
              {task.id !== "NEW" && isStory && (
                <div className="subtasks-section">
                  {(() => {
                    const doneCount = subtasks.filter((s) =>
                      isStatusDone(s.status),
                    ).length;
                    const total = subtasks.length;
                    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
                    return (
                      <>
                        <h3 className="section-title">
                          <FiCheckSquare style={{ marginRight: "8px" }} />
                          Sous-tâches{" "}
                          {total > 0 && (
                            <span className="subtask-counter">
                              {doneCount}/{total}
                            </span>
                          )}
                        </h3>

                        {total > 0 && (
                          <div className="subtask-progress">
                            <div className="subtask-progress-bar">
                              <div
                                className="subtask-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="subtask-progress-pct">{pct}%</span>
                          </div>
                        )}

                        <div className="subtask-list">
                          {subtasks.map((st) => {
                            const done = isStatusDone(st.status);
                            return (
                              <div
                                key={st.id}
                                className={`subtask-item ${done ? "is-done" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  className="subtask-check"
                                  checked={done}
                                  disabled={!canToggleSubtask}
                                  onChange={() => handleToggleSubtask(st)}
                                />
                                <span className="subtask-title" onClick={() => onOpenTask && onOpenTask(st.id, st)}>{st.title}</span>
                                {st.assignee && (
                                  <span
                                    className="subtask-avatar"
                                    style={{ background: st.assignee.bgColor }}
                                    title={st.assignee.name}
                                  >
                                    {st.assignee.initials}
                                  </span>
                                )}
                                {canManageSubtasks && (
                                  <button
                                    className="subtask-delete"
                                    title="Supprimer la sous-tâche"
                                    onClick={() => handleDeleteSubtask(st.id)}
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {total === 0 && (
                            <p className="subtask-empty">
                              Aucune sous-tâche. Découpez cette issue en
                              étapes plus petites.
                            </p>
                          )}
                        </div>

                        {canManageSubtasks && (
                          <div className="subtask-add">
                            <FiPlus className="subtask-add-icon" />
                            <input
                              className="subtask-add-input"
                              placeholder="Ajouter une sous-tâche..."
                              value={newSubtask}
                              onChange={(e) => setNewSubtask(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddSubtask();
                              }}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* COMMENTS & HISTORY TABS (existing tasks only) */}
              {task.id !== "NEW" && (
                <div className="comments-section">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border-mid)", paddingBottom: "8px" }}>
                    <h3 
                      className="section-title" 
                      style={{ cursor: "pointer", color: activeTab === "comments" ? "var(--color-primary)" : "var(--text-soft)", margin: 0 }}
                      onClick={() => { setActiveTab("comments"); setShowAllItems(false); }}
                    >
                      <FiMessageSquare style={{ marginRight: "8px" }} />
                      Commentaires {comments.length > 0 && `(${comments.length})`}
                    </h3>
                    <h3 
                      className="section-title" 
                      style={{ cursor: "pointer", color: activeTab === "history" ? "var(--color-primary)" : "var(--text-soft)", margin: 0 }}
                      onClick={() => { setActiveTab("history"); setShowAllItems(false); }}
                    >
                      Historique
                    </h3>
                  </div>


                  activeTab === "comments" ? (
                  <>
                  <div className="comment-list">
                    {comments.length === 0 ? (
                      <p className="comment-empty">
                        Aucun commentaire pour le moment.
                      </p>
                    ) : (
                      (showAllItems ? comments : comments.slice(0, 3)).map((c) => {
                        const canDeleteComment =
                          isSM ||
                          (c.authorId != null && c.authorId === currentUserId);
                        return (
                          <div key={c.id} className="comment-item">
                            <div
                              className="comment-avatar"
                              style={{
                                backgroundColor: c.author
                                  ? c.author.bgColor
                                  : "var(--border-mid)",
                              }}
                            >
                              {c.author ? c.author.initials : "?"}
                            </div>
                            <div className="comment-body">
                              <div className="comment-head">
                                <span className="comment-author">
                                  {c.author ? c.author.name : "Utilisateur supprimé"}
                                </span>
                                <span className="comment-date">
                                  {formatCommentDate(c.dateCreation)}
                                </span>
                                {canDeleteComment && (
                                  <button
                                    className="comment-delete"
                                    title="Supprimer le commentaire"
                                    onClick={() => handleDeleteComment(c.id)}
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <p className="comment-text">{c.contenu}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {comments.length > 3 && (
                      <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "8px" }}>
                        <button
                          className="btn-link"
                          onClick={() => setShowAllItems(!showAllItems)}
                          style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}
                        >
                          {showAllItems ? "Voir moins" : `Voir plus de commentaires (${comments.length - 3})`}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="comment-compose">
                    <textarea
                      className="ui-input scroll"
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          handleAddComment();
                        }
                      }}
                      style={{ width: "100%", minHeight: "70px", resize: "vertical" }}
                    />
                    <div className="comment-compose-actions">
                      <ActionBtn
                        variant="primary"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Commenter
                      </ActionBtn>
                    </div>
                  </div>
                  </>
                  ) : (
                    <div className="activity-timeline" style={{ marginTop: "16px" }}>
                      {activities.length > 0 ? (showAllItems ? activities : activities.slice(0, 3)).map((event) => {
                        let actionText = "";
                        let suffixText = "";
                        switch (event.actionType) {
                          case "CREATED_TASK": actionText = "a créé la tâche"; break;
                          case "STATUS_CHANGE": actionText = "a déplacé la tâche"; suffixText = ` vers ${event.newValue}`; break;
                          case "ASSIGNEE_CHANGE": actionText = "a réassigné la tâche"; break;
                          case "SPRINT_CHANGE": actionText = "a changé le sprint de"; break;
                          case "POINTS_UPDATE": actionText = "a estimé les points de"; suffixText = ` à ${event.newValue}`; break;
                          case "DELIVERABLE_SUBMIT": actionText = "a déposé un livrable"; break;
                          default: actionText = "a modifié la tâche"; break;
                        }

                        return (
                          <div key={event.id} className="timeline-item" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                            <div
                              className="timeline-avatar"
                              style={{ 
                                backgroundColor: event.user.bgColor || "#185fa5", 
                                color: "#FFF", 
                                width: "32px", 
                                height: "32px", 
                                borderRadius: "50%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "600",
                                flexShrink: 0
                              }}
                            >
                              {event.user.initials}
                            </div>
                            <div className="timeline-content">
                              <p className="timeline-text" style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--color-text)" }}>
                                <span className="timeline-name" style={{ fontWeight: "600" }}>{event.user.name}</span>{" "}
                                {actionText}{" "}
                                {suffixText}
                              </p>
                              <span className="timeline-time" style={{ fontSize: "12px", color: "var(--text-soft)" }}>
                                {new Date(event.dateCreation).toLocaleString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        );
                      }) : (
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Aucun historique pour cette tâche.</p>
                      )}
                      {activities.length > 3 && (
                        <div style={{ textAlign: "center", marginTop: "12px" }}>
                          <button
                            className="btn-link"
                            onClick={() => setShowAllItems(!showAllItems)}
                            style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}
                          >
                            {showAllItems ? "Voir moins" : `Voir plus d'historique (${activities.length - 3})`}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Metadata */}
            <div className="right-column">
              <div className="metadata-panel">
                {/* STATUT */}
                {task.id !== "NEW" && (
                  <div className="metadata-group" style={{ marginBottom: "8px" }}>
                    <div className="metadata-label">STATUT</div>
                    <div
                      className="metadata-value no-hover"
                      style={{ margin: 0, padding: 0 }}
                    >
                      <StatusDropdown
                        options={statusOptions}
                        value={editedTask.status}
                        onChange={(val) => handleFieldChange("status", val)}
                        disabled={!canEditStatus}
                      />
                    </div>
                  </div>
                )}

                {/* DÉTAILS */}
                <div
                  style={{
                    borderTop: task.id === "NEW" ? "none" : "1px solid var(--color-border-secondary)",
                    paddingTop: task.id === "NEW" ? "0" : "16px",
                  }}
                >
                  {task.id !== "NEW" && (
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Détails
                    </h4>
                  )}

                  <div className="metadata-group">
                    <div className="metadata-label">Type</div>
                    <div className="metadata-value no-hover">
                      {isEpic ? (
                        <span className="type-epic-badge">EPIC</span>
                      ) : isSubtask ? (
                        <span className="type-subtask-badge">SOUS-TÂCHE</span>
                      ) : (
                        <select
                          className="ui-input"
                          style={{ height: "32px", padding: "0 8px" }}
                          value={editedTask.type || "Feature"}
                          disabled={!canEditType}
                          onChange={(e) =>
                            handleFieldChange("type", e.target.value)
                          }
                        >
                          {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Priorité</div>
                    <div className="metadata-value no-hover">
                      <select
                        className="ui-input"
                        style={{ height: "32px", padding: "0 8px" }}
                        value={editedTask.priority || "medium"}
                        disabled={!canEditPriority}
                        onChange={(e) =>
                          handleFieldChange("priority", e.target.value)
                        }
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {task.id !== "NEW" && (
                    <>
                      {!isPO && (
                        <div className="metadata-group">
                          <div className="metadata-label">Assigné à</div>
                          <div className="metadata-value">
                            {canEditAssignee ? (
                              <select
                                className="ui-input"
                                style={{
                                  height: "32px",
                                  padding: "0 8px",
                                  width: "100%",
                                }}
                                value={
                                  editedTask.assignee
                                    ? editedTask.assignee.id || ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "") {
                                    handleFieldChange("assignee", null);
                                  } else {
                                    const selectedUser = allUsers.find(
                                      (u) => String(u.id) === val,
                                    );
                                    handleFieldChange("assignee", selectedUser || null);
                                  }
                                }}
                              >
                                <option value="">Non assigné</option>
                                {assigneeOptions.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="metadata-readonly">
                                {editedTask.assignee
                                  ? editedTask.assignee.name
                                  : "Non assigné"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="metadata-group">
                        <div className="metadata-label">Sprint</div>
                        <div
                          className="metadata-value"
                          style={{ color: "var(--color-primary-blue)" }}
                        >
                          {editedTask.sprintId
                            ? (() => {
                                const spr = sprints.find(s => String(s.id) === String(editedTask.sprintId));
                                return spr ? spr.name : `Sprint ${editedTask.sprintId}`;
                              })()
                            : "Backlog"}
                        </div>
                      </div>

                      {/* EPIC PARENT (stories uniquement) */}
                      {isStory && (
                        <div className="metadata-group">
                          <div className="metadata-label">Epic parent</div>
                          <div className="metadata-value no-hover">
                            <select
                              className="ui-input"
                              style={{ height: "32px", padding: "0 8px", width: "100%" }}
                              value={editedTask.parentId || ""}
                              disabled={!canEditParent}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleFieldChange(
                                  "parentId",
                                  val === "" ? null : parseInt(val, 10),
                                );
                              }}
                            >
                              <option value="">Aucun</option>
                              {epics
                                .filter((ep) => ep.id !== editedTask.id)
                                .map((ep) => (
                                  <option key={ep.id} value={ep.rawId}>
                                    {ep.title}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {!isPO && (
                        <div className="metadata-group">
                          <div className="metadata-label">Story points</div>
                          <div className="metadata-value no-hover">
                            {canEditPoints ? (
                              <input
                                type="number"
                                min="0"
                                className="ui-input"
                                style={{
                                  minHeight: "auto",
                                  height: "32px",
                                  width: "60px",
                                  padding: "4px 8px",
                                  margin: 0,
                                }}
                                value={editedTask.points || 0}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "points",
                                    Math.max(0, parseInt(e.target.value) || 0),
                                  )
                                }
                              />
                            ) : (
                              <span className="metadata-readonly">
                                {editedTask.points || 0} pts
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER FOR NEW TASK */}
        {task.id === "NEW" && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--color-border-secondary)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <ActionBtn variant="secondary" onClick={requestClose}>
              Annuler
            </ActionBtn>
            <ActionBtn variant="primary" onClick={handleCreateNewTask}>
              Créer le ticket
            </ActionBtn>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
