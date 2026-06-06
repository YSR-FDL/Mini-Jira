import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ProjectLayout from '../../components/layout/ProjectLayout';
import ActionBtn from '../../components/ui/ActionBtn';
import '../../styles/Board/BoardControlBar.css';
import '../../styles/Project/Sprints.css';
import StoryRow from '../../components/backlog/StoryRow';
import { FiMoreHorizontal, FiCalendar, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { taskService } from '../../services/taskService';
import { sprintService } from '../../services/sprintService';
import CreateSprintModal from '../../components/sprints/CreateSprintModal';

// --- HELPER COMPONENTS ---
const ProgressBar = ({ issues }) => {
  const total = issues.length || 1;
  const todoCount = issues.filter(i => i.status === 'todo').length;
  const progressCount = issues.filter(i => i.status === 'progress' || i.status === 'review' || i.status === 'in-progress').length;
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
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [upcomingSprints, setUpcomingSprints] = useState([]);
  const [completedSprints, setCompletedSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  // Terminate sprint state
  const [moveToDest, setMoveToDest] = useState('backlog');

  const loadData = async () => {
    const rawId = localStorage.getItem('selectedProjectId');
    const projectId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1;
    setLoading(true);
    
    try {
      const fetchedSprints = await sprintService.getAll(projectId);
      const fetchedTasks = await taskService.getProjectTasks(projectId);

      // Partition sprints
      const active = fetchedSprints.find(s => s.status === 'active' || s.status === 'actif');
      const upcoming = fetchedSprints.filter(s => s.status === 'planned' || s.status === 'upcoming' || s.status === 'a venir');
      const completed = fetchedSprints.filter(s => s.status === 'completed' || s.status === 'archive' || s.status === 'terminee' || s.status === 'terminé');

      // Populate issues for active sprint
      if (active) {
        active.issues = fetchedTasks.filter(t => t.sprintId === active.id);
      }

      // Populate issues for upcoming sprints
      upcoming.forEach(s => {
        s.issues = fetchedTasks.filter(t => t.sprintId === s.id);
      });

      // Populate issues for completed sprints
      completed.forEach(s => {
        s.issues = fetchedTasks.filter(t => t.sprintId === s.id);
        s.completedIssuesCount = s.issues.filter(i => i.status === 'done').length;
        s.totalPoints = s.issues.filter(i => i.status === 'done').reduce((acc, i) => acc + (i.points || 0), 0);
      });

      // Backlog tasks
      const backlog = fetchedTasks.filter(t => !t.sprintId || t.sprintId === 'backlog');

      setBacklogIssues(backlog);
      setActiveSprint(active || null);
      setUpcomingSprints(upcoming);
      setCompletedSprints(completed);
    } catch (err) {
      console.error("Error loading sprints data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    let destSprintId = 'backlog';
    if (destination.droppableId === 'active-sprint') {
      if (activeSprint) destSprintId = activeSprint.id;
    } else if (destination.droppableId.startsWith('upcoming-')) {
      destSprintId = destination.droppableId.split('upcoming-')[1];
    }

    // Call API to move task
    taskService.moveTask(draggableId, destSprintId, destination.index).then(() => {
      loadData();
    }).catch(err => {
      console.error("Error dragging/moving task:", err);
    });
  };

  const handleCreateSprint = (sprintData) => {
    const rawId = localStorage.getItem('selectedProjectId');
    const sprintToCreate = {
      ...sprintData,
      status: 'a venir',
      idProject: (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1
    };

    sprintService.create(sprintToCreate).then(() => {
      setIsCreateModalOpen(false);
      loadData();
    }).catch(err => {
      console.error("Error creating sprint:", err);
    });
  };

  const handleTerminateSprint = (e) => {
    e.preventDefault();
    if (!activeSprint) return;

    sprintService.updateStatus(activeSprint.id, 'completed').then(() => {
      const incompleteIssues = activeSprint.issues.filter(i => i.status !== 'done');
      const destSprintId = moveToDest === 'backlog' ? 'backlog' : moveToDest.split('upcoming-')[1];

      const promises = incompleteIssues.map(issue => {
        return taskService.moveTask(issue.id, destSprintId);
      });

      Promise.all(promises).then(() => {
        setIsTerminateModalOpen(false);
        loadData();
      });
    }).catch(err => {
      console.error("Error terminating sprint:", err);
    });
  };

  const startUpcomingSprint = (sprintId) => {
    if (activeSprint) {
      alert("Impossible de démarrer, un sprint est déjà actif.");
      return;
    }
    sprintService.updateStatus(sprintId, 'active').then(() => {
      loadData();
    }).catch(err => {
      console.error("Error starting sprint:", err);
    });
  };


  return (
    <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira">
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
                        activeSprint.issues.map((issue, index) => <StoryRow key={issue.id} task={issue} index={index} />)
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
                          sprint.issues.map((issue, index) => <StoryRow key={issue.id} task={issue} index={index} />)
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
                      backlogIssues.map((issue, index) => <StoryRow key={issue.id} task={issue} index={index} />)
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
        <CreateSprintModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSave={handleCreateSprint} 
        />
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
