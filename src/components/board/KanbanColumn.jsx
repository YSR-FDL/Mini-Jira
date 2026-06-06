import React, { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { FiX, FiMoreHorizontal } from "react-icons/fi";

function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onTaskClick,
  isPO,
  onDeleteColumn,
}) {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCreateTask = (e) => {
    if (e.key === "Enter") {
      if (newTaskTitle.trim()) {
        onAddTask(status, newTaskTitle.trim());
      }
      setNewTaskTitle("");
      setIsCreatingTask(false);
    } else if (e.key === "Escape") {
      setNewTaskTitle("");
      setIsCreatingTask(false);
    }
  };
  return (
    <div className="kanban-column-container">
      {/* En-tête de la colonne */}
      <div
        className="kanban-column-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3>{title}</h3>
          <span className="kanban-column-counter">{tasks.length}</span>
        </div>
        {isPO && onDeleteColumn && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="icon-btn"
              title="Options"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-tertiary)",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              <FiMoreHorizontal size={18} />
            </button>
            {isMenuOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998,
                  }}
                  onClick={() => setIsMenuOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "4px",
                    background: "var(--color-background-primary)",
                    border: "1px solid var(--color-border-tertiary)",
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 999,
                    display: "flex",
                    flexDirection: "column",
                    width: "150px",
                    padding: "4px 0",
                  }}
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (tasks.length > 0) {
                        alert(
                          "Impossible de supprimer un statut contenant des tickets. Déplacez d'abord les tickets.",
                        );
                        return;
                      }
                      onDeleteColumn(status);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: tasks.length > 0 ? "not-allowed" : "pointer",
                      color: "var(--color-danger-red)",
                      padding: "8px 12px",
                      fontSize: "13px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      opacity: tasks.length > 0 ? 0.5 : 1,
                    }}
                    title={
                      tasks.length > 0
                        ? "Ce statut contient des tickets et ne peut pas être supprimé"
                        : "Supprimer ce statut"
                    }
                  >
                    <FiX size={14} /> Supprimer le statut
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Zone de contenu Droppable */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className="kanban-column-content"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? "var(--color-primary-blue-light)"
                : "transparent",
              transition: "background-color 0.2s ease",
            }}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick && onTaskClick(task.id)}
              />
            ))}

            {isCreatingTask && (
              <div style={{ padding: "8px", marginTop: "8px" }}>
                <input
                  autoFocus
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleCreateTask}
                  placeholder="Que faut-il faire ?"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    fontSize: "13px",
                    borderRadius: "4px",
                    border: "1px solid var(--color-primary-blue)",
                    outline: "none",
                  }}
                  onBlur={() => {
                    if (!newTaskTitle.trim()) {
                      setIsCreatingTask(false);
                    }
                  }}
                />
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Pied de la colonne pour ajouter une tâche */}
      {status !== "done" && onAddTask && !isCreatingTask && (
        <div className="add-task-footer">
          <button
            className="add-task-btn"
            onClick={() => setIsCreatingTask(true)}
          >
            <svg
              className="kanban-add-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter un ticket
          </button>
        </div>
      )}
    </div>
  );
}

export default KanbanColumn;
