import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import '../../styles/Board.css';

const PRIORITY_CONFIG = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

function KanbanCard({ task, index }) {
  if (!task) return null;

  const { id, title, priority, status, tags = [], points, assignee } = task;

  const prio = PRIORITY_CONFIG[priority?.toLowerCase()] ?? 'low';
  const isDone = status?.toLowerCase() === 'done';
  const primaryTag = tags.length > 0 ? tags[0].toLowerCase() : 'feature';

  const getInitials = (name) => (name ? name.substring(0, 2).toUpperCase() : '—');

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card kanban-card-${prio} ${isDone ? 'done' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            // Légère élévation si on est en train de la déplacer
            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : undefined,
          }}
        >
          {isDone ? (
            <svg className="kanban-card-done-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className={`kanban-prio-dot ${prio}`} />
          )}

          <div className="kanban-card-id">{id}</div>
          <div className="kanban-card-title">{title}</div>

          <div className="kanban-card-footer">
            <span className={`kanban-card-tag ${primaryTag}`}>
              {tags.length > 0 ? tags[0] : 'Feature'}
            </span>

            <div className="kanban-card-meta">
              <span className="kanban-card-points">{points ? `${points} pts` : '-'}</span>

              {assignee ? (
                <div
                  className="kanban-card-avatar"
                  style={{
                    background: assignee.bgColor || '#e6f1fb',
                    color: assignee.textColor || '#185fa5',
                  }}
                  title={assignee.name || assignee}
                >
                  {assignee.initials || getInitials(assignee.name || assignee)}
                </div>
              ) : (
                <div className="kanban-card-avatar default" title="Non assigné">
                  —
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default KanbanCard;
