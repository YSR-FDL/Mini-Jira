import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import '../../styles/Board/Board.css';

const PRIORITY_CONFIG = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

function KanbanCard({ task, index, onClick, isDragDisabled, allTasks, isPO, isValidationColumn }) {
  if (!task) return null;

  const { id, title, priority, status, tags = [], points, assignee } = task;

  const prio = PRIORITY_CONFIG[priority?.toLowerCase()] ?? 'low';
  const isDone = status?.toLowerCase() === 'done';
  const primaryTag = tags.length > 0 ? tags[0].toLowerCase() : 'story';
  const isStory = primaryTag !== 'epic' && primaryTag !== 'subtask';

  const poValidation = task.poValidation || 'NONE';
  let validationClass = '';
  if (isStory && isValidationColumn && !isDone) {
    if (poValidation === 'APPROVED') {
      validationClass = 'glow-po-green';
    } else if (poValidation === 'REJECTED') {
      validationClass = 'glow-po-red';
    } else {
      validationClass = 'glow-po-blue'; // Waiting for PO
    }
  }

  // Sub-task progress: count children of this task that are "done".
  const rawId = parseInt(String(id).replace(/^[A-Z]+-/, ''), 10);
  const subtasks = (allTasks || []).filter(
    (t) => t.parentId === rawId && t.tags && t.tags[0] === 'Subtask'
  );
  const subtaskTotal = subtasks.length;
  const subtaskDone = subtasks.filter(
    (s) => /(done|termin|released|closed|ferm)/i.test(s.status || '')
  ).length;

  const getInitials = (name) => (name ? name.substring(0, 2).toUpperCase() : '—');

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card kanban-card-${prio} ${isDone ? 'done' : ''} ${validationClass}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            // Légère élévation si on est en train de la déplacer
            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : undefined,
          }}
          onClick={onClick}
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
              {tags.length > 0 ? tags[0] : 'Story'}
            </span>

            {subtaskTotal > 0 && (
              <div className="kanban-card-subtask-progress" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span>{subtaskDone}/{subtaskTotal}</span>
                <div style={{ width: '32px', height: '4px', background: 'var(--color-border-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((subtaskDone / subtaskTotal) * 100)}%`, height: '100%', background: subtaskDone === subtaskTotal ? '#4BCE97' : 'var(--color-primary-blue)', borderRadius: '2px' }} />
                </div>
              </div>
            )}

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
