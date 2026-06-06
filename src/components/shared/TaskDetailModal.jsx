import React, { useState, useEffect, useRef } from "react";
import ActionBtn from "../ui/ActionBtn";
import StatusDropdown from "../ui/StatusDropdown";
import "../../styles/Shared/TaskDetailModal.css";
import { FiMoreHorizontal, FiX, FiAlignLeft } from "react-icons/fi";
import { FaBug, FaTasks, FaBookmark } from "react-icons/fa";

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

const TaskDetailModal = ({ task, onClose, onSave, onDelete, columns = [] }) => {
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

  useEffect(() => {
    fetch("http://localhost:8080/GetAllUsers")
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
            {editedTask.id !== "NEW" && onDelete && (
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
                {isEditingTitle ? (
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
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {editedTask.title || "Ticket sans titre"}
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "40px" }}>
                <h3 className="section-title">
                  <FiAlignLeft style={{ marginRight: "8px" }} /> Description
                </h3>
                {isEditingDesc ? (
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
                    onClick={() => setIsEditingDesc(true)}
                  >
                    {editedTask.description ? (
                      editedTask.description
                    ) : (
                      <span className="description-placeholder">
                        Ajouter une description...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Metadata */}
            <div className="right-column">
              <div className="metadata-panel">
                {/* STATUT */}
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
                    />
                  </div>
                </div>

                {/* DÉTAILS */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border-secondary)",
                    paddingTop: "16px",
                  }}
                >
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

                  <div className="metadata-group">
                    <div className="metadata-label">Type</div>
                    <div className="metadata-value no-hover">
                      <select
                        className="ui-input"
                        style={{ height: "32px", padding: "0 8px" }}
                        value={editedTask.type || "Feature"}
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
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Priorité</div>
                    <div className="metadata-value no-hover">
                      <select
                        className="ui-input"
                        style={{ height: "32px", padding: "0 8px" }}
                        value={editedTask.priority || "medium"}
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

                  <div className="metadata-group">
                    <div className="metadata-label">Assigné à</div>
                    <div className="metadata-value no-hover">
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
                        {allUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Sprint</div>
                    <div
                      className="metadata-value"
                      style={{ color: "var(--color-primary-blue)" }}
                    >
                      {editedTask.sprintId
                        ? `Sprint ${editedTask.sprintId}`
                        : "Backlog"}
                    </div>
                  </div>

                  <div className="metadata-group">
                    <div className="metadata-label">Story points</div>
                    <div className="metadata-value no-hover">
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
                    </div>
                  </div>
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
