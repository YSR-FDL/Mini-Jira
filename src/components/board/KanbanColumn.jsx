import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

function KanbanColumn({ title, status, tasks, onAddTask }) {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = (e) => {
    if (e.key === 'Enter') {
      if (newTaskTitle.trim()) {
        onAddTask(status, newTaskTitle.trim());
      }
      setNewTaskTitle('');
      setIsCreatingTask(false);
    } else if (e.key === 'Escape') {
      setNewTaskTitle('');
      setIsCreatingTask(false);
    }
  };
  return (
    <div className="kanban-column-container">
      {/* En-tête de la colonne */}
      <div className="kanban-column-header">
        <h3>{title}</h3>
        <span className="kanban-column-counter">{tasks.length}</span>
      </div>

      {/* Zone de contenu Droppable */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className="kanban-column-content"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              backgroundColor: snapshot.isDraggingOver ? 'var(--color-primary-blue-light)' : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} />
            ))}

            {isCreatingTask && (
              <div style={{ padding: '8px', marginTop: '8px' }}>
                <input 
                    autoFocus
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleCreateTask}
                    placeholder="Que faut-il faire ?"
                    style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-primary-blue)', outline: 'none' }}
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
      {status !== 'done' && onAddTask && !isCreatingTask && (
        <div className="add-task-footer">
          <button className="add-task-btn" onClick={() => setIsCreatingTask(true)}>
            <svg className="kanban-add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un ticket
          </button>
        </div>
      )}
    </div>
  );
}

export default KanbanColumn;
