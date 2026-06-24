import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import StoryRow from './StoryRow';

export default function SprintBlock({ sprint, sprintTasks, onAddTask, onTagChange, onPriorityChange, sortConfig, onTaskClick, isSM, isPO, onStartClick, onTerminateClick, onDeleteClick, onEditClick, columns = [] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleCreateTask = (e) => {
        if (e.key === 'Enter' && newTaskTitle.trim()) {
            if (onAddTask) {
                onAddTask(sprint.id, newTaskTitle.trim());
            }
            setIsCreatingTask(false);
            setNewTaskTitle('');
        } else if (e.key === 'Escape') {
            setIsCreatingTask(false);
            setNewTaskTitle('');
        }
    };

    const isBacklog = sprint.id === 'backlog' || sprint.id === 'null' || sprint.id === null;

    // status badge
    let badgeClass = 'b-planned';
    let statusLabel = 'Planifié';
    if (sprint.status === 'active' || sprint.status === 'actif') {
        badgeClass = 'b-active';
        statusLabel = 'Actif';
    } else if (sprint.status === 'done' || sprint.status === 'completed' || sprint.status === 'terminee') {
        badgeClass = 'b-done';
        statusLabel = 'Terminé';
    }

    // LOGIQUE DES POINTS ET DE LA CAPACITÉ
    // Les sous-tâches (checklist) ne comptent pas dans les points du sprint.
    // Seules les stories/features/bugs/tech comptent.
    const sprintTaskIds = new Set(sprintTasks.map(t => {
        const parts = t.id ? t.id.split('-') : [];
        return parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : null;
    }).filter(Boolean));

    const countableTasks = sprintTasks.filter(task => {
        // Sub-tasks are a checklist — their points don't count independently
        const tags = task.tags || [];
        if (tags.includes('Sub-task') || tags.includes('Subtask')) return false;
        // Also exclude any task whose parent is in this sprint (defensive fallback)
        if (task.parentId && sprintTaskIds.has(task.parentId)) return false;
        return true;
    });

    // 1. Somme des Story Points (stories uniquement)
    const totalPoints = countableTasks.reduce((sum, task) => sum + (task.points || 0), 0);

    // 2. Sommer les Story Points des tâches terminées uniquement
    const doneStatusId = columns && columns.length > 0 ? columns[columns.length - 1].id : 'done';
    const donePoints = countableTasks
        .filter(task => task.status === doneStatusId || task.status === 'done')
        .reduce((sum, task) => sum + (task.points || 0), 0);

    let progressPercent = 0;
    if (totalPoints > 0) {
        progressPercent = Math.round((donePoints / totalPoints) * 100);
    } else if (sprintTasks.length > 0) {
        const doneTasksCount = sprintTasks.filter(task => task.status === doneStatusId || task.status === 'done').length;
        progressPercent = Math.round((doneTasksCount / sprintTasks.length) * 100);
    }

    return (
        <div className="sprint-block">

            {/* EN-TÊTE DU BLOC SPRINT */}
            <div className="sprint-head">
        <span
            className="chevron"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}
        >
          ▼
        </span>

                <span className="sprint-title">{sprint.name}</span>

                {/* Format de date désiré : 11 mai -> 17 mai 2026 */}
                {!isBacklog && (sprint.startDate && sprint.endDate ? (
                    <span className="sprint-dates">{sprint.startDate} -> {sprint.endDate}</span>
                ) : (
                    isSM ? (
                        <button className="btn-xs" style={{ marginLeft: 8 }} onClick={() => onEditClick && onEditClick(sprint)}>Ajouter des dates</button>
                    ) : null
                ))}

                {/* Masquer le badge if conteneur de Backlog général */}
                {!isBacklog && <span className={`badge ${badgeClass}`}>{statusLabel}</span>}

                {/* Affichage de la capacité au format souhaité (ex: 8/18 pts) */}
                {!isBacklog && (
                    <div className="sprint-stats">
                        <span className="stat"><span>{donePoints}</span>/{totalPoints} pts</span>
                        <div className="pbar-wrap">
                            <div className="pbar-bg">
                                <div className="pbar-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                        {sprint.capacity != null && sprint.capacity !== '' && (
                            <span
                                className="stat"
                                title="Points engagés / capacité du sprint"
                                style={{ color: totalPoints > sprint.capacity ? 'var(--color-danger-red)' : undefined }}
                            >
                                {totalPoints}/{sprint.capacity} cap.
                            </span>
                        )}
                    </div>
                )}

                <div className="sprint-actions">
                    {!isBacklog && isSM && (sprint.status === 'planned' || sprint.status === 'a venir' || sprint.status === 'upcoming') && (
                        <button className="btn-xs blue" onClick={() => onStartClick && onStartClick(sprint.id)}>Démarrer le sprint</button>
                    )}
                    {!isBacklog && isSM && (sprint.status === 'active' || sprint.status === 'actif') && (
                        <button className="btn-xs" onClick={() => onTerminateClick && onTerminateClick(sprint.id)}>Terminer le sprint</button>
                    )}
                    {!isBacklog && (isSM || isPO) && (
                        <div style={{ position: 'relative' }}>
                            <button className="btn-xs" onClick={() => setMenuOpen(!menuOpen)}>•••</button>
                            {menuOpen && (
                                <div className="sprint-menu" style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                    background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)',
                                    borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10,
                                    display: 'flex', flexDirection: 'column', width: '120px'
                                }}>
                                    <span style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }} onClick={() => { setMenuOpen(false); onEditClick && onEditClick(sprint); }}>Modifier le sprint</span>
                                    {isSM && (
                                        <span style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', color: 'var(--color-danger-red)' }} onClick={() => { setMenuOpen(false); onDeleteClick && onDeleteClick(sprint.id); }}>Supprimer le sprint</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* LISTE DES TICKETS INTERNES */}
            {isExpanded && (
                <Droppable droppableId={sprint.id} isDropDisabled={!!sortConfig || !(isSM || isPO)}>
                    {(provided, snapshot) => (
                        <div 
                            className="sprint-content"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                                backgroundColor: snapshot.isDraggingOver ? 'var(--color-primary-blue-light)' : 'transparent',
                                transition: 'background-color 0.2s ease',
                                minHeight: '10px'
                            }}
                        >
                            {sprintTasks.length > 0 ? (
                                sprintTasks.map((task, index) => (
                                    <StoryRow 
                                        key={task.id} 
                                        task={task} 
                                        index={index}
                                        isDragDisabled={!!sortConfig || !(isSM || isPO)}
                                        onTagChange={(newTag, tagIndex) => onTagChange && onTagChange(task.id, newTag, tagIndex)}
                                        onPriorityChange={(newPriority) => onPriorityChange && onPriorityChange(task.id, newPriority)}
                                        onClick={() => onTaskClick && onTaskClick(task.id)}
                                    />
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                                    Aucun ticket planifié dans ce bloc.
                                </div>
                            )}
                            
                            {provided.placeholder}

                            {isCreatingTask ? (
                        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--color-border-tertiary)' }}>
                            <input 
                                autoFocus
                                type="text" 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={handleCreateTask}
                                placeholder="Que faut-il faire ? (Appuyez sur Entrée pour créer)"
                                style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--color-primary-blue)', outline: 'none' }}
                                onBlur={() => {
                                    if (!newTaskTitle.trim()) {
                                        setIsCreatingTask(false);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        isPO && (
                            <div className="add-story" onClick={() => setIsCreatingTask(true)}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Créer un ticket
                            </div>
                        )
                    )}
                        </div>
                    )}
                </Droppable>
            )}

        </div>
    );
}