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
  todo: { className: "story-status s-todo", label: "À faire" },
  "à faire": { className: "story-status s-todo", label: "À faire" },
  "a faire": { className: "story-status s-todo", label: "À faire" },
  done: { className: "story-status s-done", label: "Terminé" },
  "terminé": { className: "story-status s-done", label: "Terminé" },
  "termine": { className: "story-status s-done", label: "Terminé" },
  "termin": { className: "story-status s-done", label: "Terminé" },
  "terminee": { className: "story-status s-done", label: "Terminé" },
  "terminée": { className: "story-status s-done", label: "Terminé" },
  review: { className: "story-status s-rev", label: "En revue" },
  "en revue": { className: "story-status s-rev", label: "En revue" },
};

const TAG_CONFIG = {
  feature: { className: "tag t-feat", label: "Feature" },
  bug: { className: "tag t-bug", label: "Bug" },
  tech: { className: "tag t-tech", label: "Tech" },
  chore: { className: "tag t-feat", label: "Chore" }, // Using feat style or maybe neutral gray
  spike: { className: "tag t-bug", label: "Spike" },  // Using bug style or custom
};

function StoryRow({ task, onTagChange, onPriorityChange, index, isDragDisabled = false, onClick }) {
  if (!task) return null;

  const { id, title, priority, status, tags = [], points, assignee } = task;

  const prio = PRIORITY_CONFIG[priority?.toLowerCase()] ?? PRIORITY_CONFIG.low;
  const stat = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG["todo"];

  const getInitials = (name) =>
    name ? name.substring(0, 2).toUpperCase() : "—";

  const handleTagClick = (tagIdx, e) => {
    e.stopPropagation();
    if (!onTagChange) return;

    const types = ["Feature", "Bug", "Tech", "Chore", "Spike"];
    let currentTag = (tags[tagIdx] || "").toLowerCase();
    if (currentTag === "fonctionnalité" || currentTag === "fonctionnalite") currentTag = "feature";
    else if (currentTag === "anomalie") currentTag = "bug";
    else if (currentTag === "technique") currentTag = "tech";
    else if (currentTag === "chore") currentTag = "chore";
    else if (currentTag === "spike") currentTag = "spike";

    let nextType = "Feature";
    const currentIndex = types.findIndex(t => t.toLowerCase() === currentTag);
    if (currentIndex !== -1) {
      nextType = types[(currentIndex + 1) % types.length];
    } else {
      nextType = "Feature";
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
