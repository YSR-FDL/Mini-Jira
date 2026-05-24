import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ProjectLayout from '../../components/layout/ProjectLayout';
import ActionBtn from '../../components/ui/ActionBtn';
import '../../styles/BoardControlBar.css';
import './Sprints.css';
import { FiMoreHorizontal, FiCalendar, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { FaTasks, FaBug, FaBookmark } from 'react-icons/fa';

import { initialBacklogIssues, initialActiveSprint, initialUpcomingSprints, initialCompletedSprints } from '../../data/projectsMockData';

// --- HELPER COMPONENTS ---
const getTypeIcon = (type) => {
  switch(type) {
    case 'bug': return <FaBug color="#F15B50" />;
    case 'story': return <FaBookmark color="#579DFF" />;
    default: return <FaTasks color="#4BCE97" />;
  }
};

const IssueRow = ({ issue, index }) => (
  <Draggable draggableId={issue.id} index={index}>
    {(provided, snapshot) => (
      <div 
        className={`issue-row ${snapshot.isDragging ? 'is-dragging' : ''}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <div className="issue-drag-handle">
          <FiMoreHorizontal size={16} style={{ transform: 'rotate(90deg)' }} />
        </div>
        <div className="issue-id">
          {getTypeIcon(issue.type)} <span>{issue.id}</span>
        </div>
        <div className="issue-title">{issue.title}</div>
        <div className="issue-meta">
          <div className="issue-status">{issue.status}</div>
          <div className="issue-points">{issue.points || '-'}</div>
          {issue.assignee ? (
            <div className="issue-avatar">{issue.assignee}</div>
          ) : (
            <div className="issue-avatar" style={{backgroundColor: '#DFE1E6', color: '#172B4D'}}>?</div>
          )}
        </div>
      </div>
    )}
  </Draggable>
);

const ProgressBar = ({ issues }) => {
  const total = issues.length || 1;
  const todoCount = issues.filter(i => i.status === 'todo').length;
  const progressCount = issues.filter(i => i.status === 'progress' || i.status === 'review').length;
  const doneCount = issues.filter(i => i.status === 'done').length;

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <span>{doneCount} terminés</span>
        <span>{progressCount} en cours</span>
        <span>{todoCount} à faire</span>
      </div>
      <div className="progress-bar">
        <div className="progress-segment done" style={{ width: `${(doneCount / total) * 100}%` }}></div>
        <div className="progress-segment progress" style={{ width: `${(progressCount / total) * 100}%` }}></div>
        <div className="progress-segment todo" style={{ width: `${(todoCount / total) * 100}%` }}></div>
      </div>
    </div>
  );
};


// --- MAIN PAGE ---
export default function Sprints() {
  const [activeTab, setActiveTab] = useState('sprints');
  const [filter, setFilter] = useState('all'); 
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  // Lists state
  const [backlogIssues, setBacklogIssues] = useState(initialBacklogIssues);
  const [activeSprint, setActiveSprint] = useState(initialActiveSprint);
  const [upcomingSprints, setUpcomingSprints] = useState(initialUpcomingSprints);
  const [completedSprints, setCompletedSprints] = useState(initialCompletedSprints);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  // Create sprint form state
  const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '', goal: '' });

  // Terminate sprint state
  const [moveToDest, setMoveToDest] = useState('backlog');

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return; 
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const getList = (id) => {
      if (id === 'backlog') return backlogIssues;
      if (id === 'active-sprint') return activeSprint ? activeSprint.issues : [];
      if (id.startsWith('upcoming-')) {
        const sprintId = id.split('upcoming-')[1];
        return upcomingSprints.find(s => s.id === sprintId)?.issues || [];
      }
      return [];
    };

    const sourceList = getList(source.droppableId);
    const destList = getList(destination.droppableId);

    const sourceClone = Array.from(sourceList);
    const destClone = source.droppableId === destination.droppableId ? sourceClone : Array.from(destList);
    
    const [removed] = sourceClone.splice(source.index, 1);
    destClone.splice(destination.index, 0, removed);

    const updateList = (id, newIssues) => {
      if (id === 'backlog') setBacklogIssues(newIssues);
      else if (id === 'active-sprint') setActiveSprint({ ...activeSprint, issues: newIssues });
      else if (id.startsWith('upcoming-')) {
        const sprintId = id.split('upcoming-')[1];
        setUpcomingSprints(prev => prev.map(s => s.id === sprintId ? { ...s, issues: newIssues } : s));
      }
    };

    if (source.droppableId === destination.droppableId) {
      updateList(source.droppableId, sourceClone);
    } else {
      updateList(source.droppableId, sourceClone);
      updateList(destination.droppableId, destClone);
    }
  };

  const handleCreateSprint = (e) => {
    e.preventDefault();
    const sprintToCreate = {
      id: `sprint-${Date.now()}`,
      name: newSprint.name || `Sprint ${upcomingSprints.length + 5}`,
      startDate: newSprint.startDate,
      endDate: newSprint.endDate,
      goal: newSprint.goal,
      issues: []
    };
    setUpcomingSprints([...upcomingSprints, sprintToCreate]);
    setIsCreateModalOpen(false);
    setNewSprint({ name: '', startDate: '', endDate: '', goal: '' });
  };

  const handleTerminateSprint = (e) => {
    e.preventDefault();
    if (!activeSprint) return;

    const doneIssues = activeSprint.issues.filter(i => i.status === 'done');
    const incompleteIssues = activeSprint.issues.filter(i => i.status !== 'done');

    // Mettre à jour le backlog ou le prochain sprint
    if (moveToDest === 'backlog') {
      setBacklogIssues([...backlogIssues, ...incompleteIssues]);
    } else if (moveToDest.startsWith('upcoming-')) {
      const targetSprintId = moveToDest.split('upcoming-')[1];
      setUpcomingSprints(prev => prev.map(s => 
        s.id === targetSprintId ? { ...s, issues: [...s.issues, ...incompleteIssues] } : s
      ));
    }

    // Ajouter le sprint aux complétés
    const totalPoints = doneIssues.reduce((acc, i) => acc + (i.points || 0), 0);
    const completedSprint = {
      ...activeSprint,
      completedIssuesCount: doneIssues.length,
      totalPoints,
      issues: [] // On ne garde pas les issues complètes en mémoire pour cette démo
    };

    setCompletedSprints([completedSprint, ...completedSprints]);
    setActiveSprint(null);
    setIsTerminateModalOpen(false);
  };

  const startUpcomingSprint = (sprintId) => {
    if (activeSprint) {
      alert("Impossible de démarrer, un sprint est déjà actif.");
      return;
    }
    const sprintToStart = upcomingSprints.find(s => s.id === sprintId);
    setActiveSprint(sprintToStart);
    setUpcomingSprints(upcomingSprints.filter(s => s.id !== sprintId));
  };


  return (
    <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="sprints-page-container scroll">
          
          <div className="sprints-header">
            <h1 className="sprints-title">Sprints</h1>
            <ActionBtn variant="primary" onClick={() => setIsCreateModalOpen(true)}>Créer un sprint</ActionBtn>
          </div>

          <div className="filter-bar" style={{ marginBottom: '32px' }}>
            {['all', 'active', 'upcoming', 'completed'].map(f => (
              <span 
                key={f} 
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'upcoming' ? 'À venir' : 'Terminés'}
              </span>
            ))}
          </div>

          {/* ACTIVE SPRINT */}
          {(filter === 'all' || filter === 'active') && activeSprint && (
            <div className="sprints-section">
              <h2 className="section-heading">Sprint Actif <span className="badge">1</span></h2>
              
              <div className="sprint-card active-sprint">
                <div className="sprint-card-header">
                  <div className="sprint-info" style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                    <div className="sprint-name" style={{ textAlign: 'left', width: '100%', marginBottom: '4px' }}>{activeSprint.name}</div>
                    <div className="sprint-meta" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                      <span className="sprint-status-badge status-active">Actif</span>
                      <span><FiCalendar style={{marginRight: '4px', position: 'relative', top: '2px'}}/> {activeSprint.startDate} - {activeSprint.endDate}</span>
                      {activeSprint.goal && <span style={{fontStyle: 'italic', display: 'block', width: '100%', marginTop: '4px'}}>Objectif: {activeSprint.goal}</span>}
                    </div>
                  </div>
                  <div className="sprint-actions">
                    <ActionBtn variant="secondary">Voir le board</ActionBtn>
                    <ActionBtn variant="secondary" style={{backgroundColor: '#F4F5F7'}} onClick={() => setIsTerminateModalOpen(true)}>Terminer le sprint</ActionBtn>
                  </div>
                </div>

                <ProgressBar issues={activeSprint.issues} />

                <Droppable droppableId="active-sprint">
                  {(provided, snapshot) => (
                    <div 
                      className={`sprint-issues-container ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {activeSprint.issues.length === 0 ? (
                        <div className="empty-sprint">Glissez des tickets ici pour les planifier dans ce sprint.</div>
                      ) : (
                        activeSprint.issues.map((issue, index) => <IssueRow key={issue.id} issue={issue} index={index} />)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          )}

          {/* UPCOMING SPRINTS */}
          {(filter === 'all' || filter === 'upcoming') && upcomingSprints.length > 0 && (
            <div className="sprints-section">
              <h2 className="section-heading">Sprints à venir <span className="badge">{upcomingSprints.length}</span></h2>
              
              {upcomingSprints.map(sprint => (
                <div key={sprint.id} className="sprint-card">
                  <div className="sprint-card-header">
                    <div className="sprint-info" style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                    <div className="sprint-name" style={{ textAlign: 'left', width: '100%', marginBottom: '4px' }}>{sprint.name}</div>
                    <div className="sprint-meta" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                      <span className="sprint-status-badge status-upcoming">À venir</span>
                      <span><FiCalendar style={{marginRight: '4px', position: 'relative', top: '2px'}}/> {sprint.startDate || 'Aucune date'} - {sprint.endDate || 'Aucune date'}</span>
                    </div>
                  </div>
                    <div className="sprint-actions">
                      <ActionBtn 
                        variant="secondary" 
                        onClick={() => startUpcomingSprint(sprint.id)} 
                        style={activeSprint ? {opacity: 0.6} : {}}
                      >
                        Démarrer
                      </ActionBtn>
                      <button className="icon-btn"><FiMoreHorizontal size={18} /></button>
                    </div>
                  </div>

                  <Droppable droppableId={`upcoming-${sprint.id}`}>
                    {(provided, snapshot) => (
                      <div 
                        className={`sprint-issues-container ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {sprint.issues.length === 0 ? (
                          <div className="empty-sprint">Planifiez ce sprint en y glissant des tickets depuis le backlog.</div>
                        ) : (
                          sprint.issues.map((issue, index) => <IssueRow key={issue.id} issue={issue} index={index} />)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          )}

          {/* BACKLOG SECTION FOR DRAG AND DROP */}
          {(filter === 'all' || filter === 'active' || filter === 'upcoming') && (
            <div className="sprints-section" style={{marginTop: '48px'}}>
              <h2 className="section-heading">Backlog (Non planifié) <span className="badge">{backlogIssues.length}</span></h2>
              
              <Droppable droppableId="backlog">
                {(provided, snapshot) => (
                  <div 
                    className={`sprint-issues-container ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ backgroundColor: 'white', border: '1px solid var(--color-border-secondary)', padding: '16px', borderRadius: '8px' }}
                  >
                    {backlogIssues.length === 0 ? (
                      <div className="empty-sprint">Le backlog est vide. Créez de nouveaux tickets.</div>
                    ) : (
                      backlogIssues.map((issue, index) => <IssueRow key={issue.id} issue={issue} index={index} />)
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}

          {/* COMPLETED SPRINTS */}
          {(filter === 'all' || filter === 'completed') && completedSprints.length > 0 && (
            <div className="sprints-section" style={{marginTop: '48px', opacity: 0.8}}>
              <h2 
                className="section-heading" 
                style={{cursor: 'pointer'}} 
                onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
              >
                {isCompletedCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                Sprints terminés <span className="badge">{completedSprints.length}</span>
              </h2>
              
              {!isCompletedCollapsed && completedSprints.map(sprint => (
                <div key={sprint.id} className="sprint-card" style={{padding: '16px 24px'}}>
                  <div className="sprint-card-header" style={{margin: 0}}>
                    <div className="sprint-info">
                      <div className="sprint-name" style={{fontSize: '16px'}}>{sprint.name}</div>
                      <div className="sprint-meta">
                        <span className="sprint-status-badge status-completed">Terminé</span>
                        <span>{sprint.startDate} - {sprint.endDate}</span>
                        <span>{sprint.completedIssuesCount} issues terminées ({sprint.totalPoints} pts)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </DragDropContext>

      {/* CREATE SPRINT MODAL */}
      {isCreateModalOpen && (
        <div className="sprints-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="sprints-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sprints-modal-header">
              Créer un sprint
            </div>
            <form onSubmit={handleCreateSprint}>
              <div className="sprints-modal-body">
                <div className="form-group-sprint">
                  <label>Nom du sprint</label>
                  <input 
                    type="text" 
                    value={newSprint.name} 
                    onChange={e => setNewSprint({...newSprint, name: e.target.value})} 
                    placeholder="Sprint 5" 
                    required 
                  />
                </div>
                <div style={{display: 'flex', gap: '16px'}}>
                  <div className="form-group-sprint" style={{flex: 1}}>
                    <label>Date de début</label>
                    <input 
                      type="date" 
                      value={newSprint.startDate} 
                      onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group-sprint" style={{flex: 1}}>
                    <label>Date de fin</label>
                    <input 
                      type="date" 
                      value={newSprint.endDate} 
                      onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group-sprint">
                  <label>Objectif du sprint</label>
                  <textarea 
                    value={newSprint.goal} 
                    onChange={e => setNewSprint({...newSprint, goal: e.target.value})} 
                    placeholder="Qu'essayons-nous d'accomplir ?" 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="sprints-modal-footer">
                <ActionBtn variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Annuler</ActionBtn>
                <ActionBtn variant="primary" type="submit">Créer</ActionBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TERMINATE SPRINT MODAL */}
      {isTerminateModalOpen && activeSprint && (
        <div className="sprints-modal-overlay" onClick={() => setIsTerminateModalOpen(false)}>
          <div className="sprints-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sprints-modal-header">
              Terminer le sprint : {activeSprint.name}
            </div>
            <form onSubmit={handleTerminateSprint}>
              <div className="sprints-modal-body">
                <p style={{fontSize: '14px', color: 'var(--color-text-primary)'}}>
                  Ce sprint contient <strong>{activeSprint.issues.filter(i => i.status !== 'done').length}</strong> issue(s) non terminée(s).
                  <br/><br/>
                  Où souhaitez-vous déplacer les issues non terminées ?
                </p>
                <div className="form-group-sprint">
                  <label>Déplacer vers</label>
                  <select value={moveToDest} onChange={e => setMoveToDest(e.target.value)}>
                    <option value="backlog">Nouveau backlog</option>
                    {upcomingSprints.map(sprint => (
                      <option key={sprint.id} value={`upcoming-${sprint.id}`}>{sprint.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sprints-modal-footer">
                <ActionBtn variant="secondary" onClick={() => setIsTerminateModalOpen(false)}>Annuler</ActionBtn>
                <ActionBtn variant="primary" type="submit">Terminer le sprint</ActionBtn>
              </div>
            </form>
          </div>
        </div>
      )}

    </ProjectLayout>
  );
}
