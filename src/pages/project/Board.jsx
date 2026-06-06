import React, { useState, useMemo, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import ProjectLayout from '../../components/layout/ProjectLayout';
import KanbanColumn from '../../components/board/KanbanColumn';
import BoardControlBar from '../../components/board/BoardControlBar';
import TaskDetailModal from '../../components/shared/TaskDetailModal';
import { taskService } from '../../services/taskService';
import { sprintService } from '../../services/sprintService';
import { projectService } from '../../services/projectService';
import ActionBtn from '../../components/ui/ActionBtn';
import '../../styles/Board/Board.css';

export default function Board() {
  const [activeTab, setActiveTab] = useState('board');
  const [activeSprint, setActiveSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [activeAssignees, setActiveAssignees] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // RBAC State
  const [isSM, setIsSM] = useState(false);
  const [isPO, setIsPO] = useState(false);

  useEffect(() => {
    const loadBoard = async () => {
      const rawId = localStorage.getItem('selectedProjectId');
      const projectId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1;
      try {
        // 1. Load project to get columns (états) and roles
        const projectData = await projectService.getProjectById(projectId);
        
        // Compute RBAC
        const currentUserId = parseInt(localStorage.getItem('userId'), 10);
        if (projectData && currentUserId) {
          setIsSM(projectData.idSM === currentUserId || projectData.idCreateur === currentUserId);
          setIsPO(projectData.idPO === currentUserId || projectData.idCreateur === currentUserId);
        }

        if (projectData && projectData.etats && projectData.etats.length > 0) {
          setColumns(projectData.etats.map(etat => ({ id: etat.trim(), title: etat.trim() })));
        }

        // 2. Load sprints to find the active one
        const sprints = await sprintService.getAll(projectId);
        const active = sprints.find(s => s.status === 'active' || s.status === 'actif');
        setActiveSprint(active || null);

        // 3. Load tasks for the active sprint
        if (active) {
          const allTasks = await taskService.getProjectTasks(projectId);
          const sprintTasks = allTasks.filter(t => String(t.sprintId) === String(active.id));
          setTasks(sprintTasks);
        }
      } catch (err) {
        console.error("Error loading board data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBoard();
  }, []);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return prevTasks;
      const newTasks = [...prevTasks];
      const draggedTask = { ...newTasks[taskIndex], status: destination.droppableId };
      newTasks.splice(taskIndex, 1);
      newTasks.splice(destination.index, 0, draggedTask);
      return newTasks;
    });

    taskService.updateTaskStatus(draggableId, destination.droppableId).catch(err => {
      console.error('Erreur lors du changement de statut:', err);
    });
  };

  const handleAddTask = (statusId, title) => {
    if (!activeSprint || !title.trim()) return;
    const tempId = `MJ-TEMP-${Date.now()}`;
    const optimisticTask = { id: tempId, title, priority: "medium", status: statusId, tags: ["feature"], points: 0, sprintId: activeSprint.id };
    setTasks(prev => [...prev, optimisticTask]);

    taskService.createTask(activeSprint.id, title)
        .then(newTask => setTasks(prev => prev.map(t => t.id === tempId ? { ...newTask, status: statusId } : t)))
        .catch(() => setTasks(prev => prev.filter(t => t.id !== tempId)));
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTaskId(null);
    taskService.updateTask(updatedTask.id, updatedTask);
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    const title = newColumnTitle.trim();
    const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (columns.some(col => col.id === id)) return;
    
    const newColumns = [...columns, { id, title }];
    setColumns(newColumns);
    setIsAddingColumn(false);
    setNewColumnTitle('');
    
    const rawId = localStorage.getItem('selectedProjectId');
    const projectId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1;
    const etats = newColumns.map(col => col.title);
    await projectService.updateProjectStates(projectId, etats);
  };

  // --- FILTER & CONTROL HANDLERS ---
  const assignees = useMemo(() => {
    const uniqueMap = new Map();
    tasks.forEach((task) => {
      if (task.assignee && task.assignee.name && !uniqueMap.has(task.assignee.name)) {
        uniqueMap.set(task.assignee.name, task.assignee);
      }
    });
    return Array.from(uniqueMap.values());
  }, [tasks]);

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = search === '' || task.title.toLowerCase().includes(search.toLowerCase()) || task.id.toLowerCase().includes(search.toLowerCase());
      const matchesAssignee = activeAssignees.length === 0 || (task.assignee && activeAssignees.includes(task.assignee.name));
      return matchesSearch && matchesAssignee;
    });
  }, [tasks, search, activeAssignees]);

  const handleToggleAssignee = (assigneeName) => {
    setActiveAssignees(prev => prev.includes(assigneeName) ? prev.filter(n => n !== assigneeName) : [...prev, assigneeName]);
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveAssignees([]);
  };

  const handleCompleteSprint = () => {
    if (window.confirm(`Voulez-vous vraiment clôturer le sprint "${activeSprint.name}" ?`)) {
      sprintService.updateStatus(activeSprint.id, 'done').then(() => {
        alert(`Le sprint a été clôturé.`);
        window.location.reload(); // Quick MVP refresh
      });
    }
  };

  if (loading) return <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira"><div style={{ padding: '24px', textAlign: 'center' }}>Chargement du board...</div></ProjectLayout>;

  if (!activeSprint) {
    return (
        <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira">
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Aucun sprint actif pour le moment.</div>
        </ProjectLayout>
    );
  }

  return (
      <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira">
        <BoardControlBar
            search={search}
            onSearch={setSearch}
            assignees={assignees}
            activeAssignees={activeAssignees}
            onToggleAssignee={handleToggleAssignee}
            onClearFilters={handleClearFilters}
            sprint={activeSprint}
            onCompleteSprint={handleCompleteSprint}
            isSM={isSM}
        />
        {/* NOUVEAU BOUTON DE CRÉATION SUR LE BOARD */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', paddingRight: '10px' }}>
          {isPO && (
            <ActionBtn size="sm" variant="secondary" onClick={() => setSelectedTaskId('NEW')}>
              + Créer un ticket détaillé
            </ActionBtn>
          )}
        </div>
        <div className="kanban-board-container scroll">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="kanban-board">
              {columns.map((col) => (
                  <KanbanColumn key={col.id} title={col.title} status={col.id} tasks={activeTasks.filter((t) => t.status === col.id)} onAddTask={handleAddTask} onTaskClick={setSelectedTaskId} />
              ))}
              <div className="kanban-column-container add-column-wrapper">
                {isAddingColumn ? (
                    <div className="add-column-form">
                      <input type="text" className="ui-input new-column-title-input" placeholder="Nom du statut..." value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); else if (e.key === 'Escape') setIsAddingColumn(false); }} autoFocus />
                      <div className="add-column-actions">
                        <button onClick={handleAddColumn} className="add-column-save-btn">Ajouter</button>
                        <button onClick={() => setIsAddingColumn(false)} className="add-column-cancel-btn">Annuler</button>
                      </div>
                    </div>
                ) : (
                    <button className="add-column-trigger-btn" onClick={() => setIsAddingColumn(true)}><svg className="kanban-add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '6px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Ajouter un statut</button>
                )}
              </div>
            </div>
          </DragDropContext>
        </div>
        {selectedTaskId && (
            <TaskDetailModal 
                task={selectedTaskId === 'NEW' ? { id: 'NEW', title: '', description: '', status: columns.length > 0 ? columns[0].id : 'todo', priority: 'medium', tags: ['Feature'], sprintId: activeSprint.id } : tasks.find(t => t.id === selectedTaskId)} 
                onClose={() => setSelectedTaskId(null)} 
                onSave={selectedTaskId === 'NEW' ? (taskData) => { taskService.createDetailedTask(taskData).then(() => { setSelectedTaskId(null); window.location.reload(); }); } : handleUpdateTask} 
                columns={columns} 
            />
        )}
      </ProjectLayout>
  );
}