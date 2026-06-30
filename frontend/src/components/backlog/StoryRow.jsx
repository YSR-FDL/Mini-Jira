import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const PRIORITY_CONFIG = {
  critical: { dotClass: "prio-dot p-critical", badgeClass: "priority-badge priority-critical-badge", label: "CRITICAL" },
  critique: { dotClass: "prio-dot p-critical", badgeClass: "priority-badge priority-critical-badge", label: "CRITICAL" },
  high: { dotClass: "prio-dot p-high", badgeClass: "priority-badge priority-high-badge", label: "HIGH" },
  élevée: { dotClass: "prio-dot p-high", badgeClass: "priority-badge priority-high-badge", label: "HIGH" },
  elevee: { dotClass: "prio-dot p-high", badgeClass: "priority-badge priority-high-badge", label: "HIGH" },
  medium: { dotClass: "prio-dot p-med", badgeClass: "priority-badge priority-medium-badge", label: "MEDIUM" },
  moyenne: { dotClass: "prio-dot p-med", badgeClass: "priority-badge priority-medium-badge", label: "MEDIUM" },
  low: { dotClass: "prio-dot p-low", badgeClass: "priority-badge priority-low-badge", label: "LOW" },
  faible: { dotClass: "prio-dot p-low", badgeClass: "priority-badge priority-low-badge", label: "LOW" },
};

const STATUS_CONFIG = {
  "in-progress": { className: "story-status s-prog", label: "En cours" },
  "en cours": { className: "story-status s-prog", label: "En cours" },
  todo: { className: "story-status s-todo", label: "A faire" },
  "à faire": { className: "story-status s-todo", label: "A faire" },
  "a faire": { className: "story-status s-todo", label: "A faire" },
  done: { className: "story-status s-done", label: "Termine" },
  "terminé": { className: "story-status s-done", label: "Termine" },
  "termine": { className: "story-status s-done", label: "Termine" },
  "termin": { className: "story-status s-done", label: "Termine" },
  "terminee": { className: "story-status s-done", label: "Termine" },
  "terminée": { className: "story-status s-done", label: "Termine" },
  review: { className: "story-status s-rev", label: "En revue" },
  "en revue": { className: "story-status s-rev", label: "En revue" },
};

const TAG_CONFIG = {
  story: { className: "tag t-feat", label: "Story" },
  feature: { className: "tag t-feat", label: "Feature" },
  request: { className: "tag t-tech", label: "Request" },
  tech: { className: "tag t-tech", label: "Tech" },
  bug: { className: "tag t-bug", label: "Bug" },
};

function StoryRow({ task, onTagChange, onPriorityChange, index, isDragDisabled = false, onClick, allTasks = [] }) {
  if (!task) return null;

  const { id, title, priority, status, tags = [], points, assignee } = task;

  const prio = PRIORITY_CONFIG[priority?.toLowerCase()] ?? PRIORITY_CONFIG.low;
  const stat = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG["todo"];

  // Subtask progress badge: count children of this task
  const rawId = parseInt(String(id).replace(/^[A-Z]+-/, ''), 10);
  const subtasks = allTasks.filter((t) => {
    if (t.parentId !== rawId) return false;
    const type = t.tags && t.tags[0];
    return type === 'Subtask' || type === 'Sub-task' || type === 'Sous-tache';
  });
  const subtaskTotal = subtasks.length;
  const subtaskDone = subtasks.filter(
    (s) => /(done|termin|released|closed|ferm)/i.test(s.status || '')
  ).length;

  const getInitials = (name) =>
    name ? name.substring(0, 2).toUpperCase() : "—";

  const handleTagClick = (tagIdx, e) => {
    e.stopPropagation();
    if (!onTagChange) return;

    const types = ["Story", "Feature", "Request", "Tech", "Bug"];
    let currentTag = (tags[tagIdx] || "").toLowerCase();
    if (currentTag === "fonctionnalité" || currentTag === "fonctionnalite") currentTag = "feature";
    else if (currentTag === "anomalie") currentTag = "bug";

    let nextType = "Story";
    const currentIndex = types.findIndex(t => t.toLowerCase() === currentTag);
    if (currentIndex !== -1) {
      nextType = types[(currentIndex + 1) % types.length];
    } else {
      nextType = "Story";
    }

    onTagChange(nextType, tagIdx);
  };

  const handlePriorityClick = (e) => {
    e.stopPropagation();
    if (!onPriorityChange) return;

    const priorities = ["low", "medium", "high", "critical"];
    let currentPrio = (priority || "").toLowerCase();
    
    if (currentPrio === "faible") currentPrio = "low";
    else if (currentPrio === "moyenne") currentPrio = "medium";
    else if (currentPrio === "élevée" || currentPrio === "elevee") currentPrio = "high";
    else if (currentPrio === "critique") currentPrio = "critical";

    let nextPrio = "low";
    const currentIndex = priorities.indexOf(currentPrio);
    if (currentIndex !== -1) {
      nextPrio = priorities[(currentIndex + 1) % priorities.length];
    } else {
      nextPrio = "medium";
    }

    onPriorityChange(nextPrio);
  };

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div 
          className="story-row"
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
          }}
          onClick={onClick}
        >
          <span className="drag-handle" {...provided.dragHandleProps}>⠿</span>
          <div className={prio.dotClass} />
          <span className="story-id">{id}</span>
          <span 
            className={prio.badgeClass} 
            onClick={onPriorityChange ? handlePriorityClick : undefined}
            style={{ cursor: onPriorityChange ? 'pointer' : 'default' }}
            title={onPriorityChange ? "Cliquez pour changer la priorité" : undefined}
          >
            {prio.label}
          </span>
          <span className="story-title">{title}</span>

          <div className="story-tags">
            {tags.length === 0 ? (
              <span
                className="tag t-feat"
                onClick={(e) => {
                  if (!onTagChange) return;
                  e.stopPropagation();
                  onTagChange("Bug", 0);
                }}
                style={{ cursor: onTagChange ? "pointer" : "default" }}
                title={onTagChange ? "Cliquez pour changer le tag" : undefined}
              >
                Feature
              </span>
            ) : (
              tags.map((tag, tagIdx) => {
                const t = TAG_CONFIG[tag.toLowerCase()] ?? {
                  className: "tag",
                  label: tag,
                };
                return (
                  <span
                    key={`${tag}-${tagIdx}`}
                    className={t.className}
                    onClick={(e) => handleTagClick(tagIdx, e)}
                    style={{ cursor: onTagChange ? "pointer" : "default" }}
                    title={onTagChange ? "Cliquez pour changer le tag" : undefined}
                  >
                    {t.label}
                  </span>
                );
              })
            )}
          </div>

          <span className={stat.className}>{stat.label}</span>

          {/* Subtask progress badge */}
          {subtaskTotal > 0 && (
            <span className="story-subtask-badge" title={`Sous-taches : ${subtaskDone}/${subtaskTotal} terminées`}>
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: '3px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {subtaskDone}/{subtaskTotal}
            </span>
          )}

          <span className="story-pts">{points ? `${points} pts` : "-"}</span>

          {assignee ? (
            <div
              className="story-av"
              style={{
                background: assignee.bgColor || "#e6f1fb",
                color: assignee.textColor || "#185fa5",
              }}
              title={assignee.name || assignee}
            >
              {assignee.initials || getInitials(assignee.name || assignee)}
            </div>
          ) : (
            <div
              className="story-av"
              style={{ background: "#f4f5f7", color: "#8993a4" }}
            >
              —
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default StoryRow;
