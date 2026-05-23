import React, { useState, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import ProjectLayout from '../../components/layout/ProjectLayout';
import KanbanColumn from '../../components/board/KanbanColumn';
import BoardControlBar from '../../components/board/BoardControlBar';
import { initialSprints, initialTasks } from '../../data/projectsMockData';
import { taskService } from '../../services/taskService';

import '../../styles/Board.css';

const COLUMNS = [
  { id: 'todo', title: 'À Faire' },
  { id: 'in-progress', title: 'En Cours' },
  { id: 'review', title: 'En Revue' },
  { id: 'done', title: 'Terminé' },
];

export default function Board() {
  const [activeTab, setActiveTab] = useState('board');
  const [sprints, setSprints] = useState(initialSprints);
  const [tasks, setTasks] = useState(initialTasks);

  // Nouveaux états pour la barre de contrôle
  const [search, setSearch] = useState('');
  const [activeAssignees, setActiveAssignees] = useState([]);

  // Trouver le sprint actif
  const activeSprint = useMemo(() => sprints.find((s) => s.status === 'active'), [sprints]);

  // Récupérer uniquement les tickets de ce sprint
  const sprintTasks = useMemo(() => {
    if (!activeSprint) return [];
    return tasks.filter((t) => t.sprintId === activeSprint.id);
  }, [tasks, activeSprint]);

  // Extraction des assignés uniques pour le sprint actuel
  const assignees = useMemo(() => {
    const uniqueMap = new Map();
    sprintTasks.forEach((task) => {
      if (task.assignee && task.assignee.name) {
        if (!uniqueMap.has(task.assignee.name)) {
          uniqueMap.set(task.assignee.name, task.assignee);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [sprintTasks]);

  // Filtrer les tâches actives selon la recherche et les assignés
  const activeTasks = useMemo(() => {
    return sprintTasks.filter((task) => {
      // Filtre texte
      const matchesSearch = search === '' || 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase());
        
      // Filtre avatar
      const matchesAssignee = activeAssignees.length === 0 || 
        (task.assignee && activeAssignees.includes(task.assignee.name));

      return matchesSearch && matchesAssignee;
    });
  }, [sprintTasks, search, activeAssignees]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Mise à jour optimiste
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return prevTasks;

      const newTasks = [...prevTasks];
      const draggedTask = { ...newTasks[taskIndex], status: destination.droppableId };
      newTasks.splice(taskIndex, 1);

      // Trouver l'index global pour insérer
      const destStatusTasks = newTasks.filter(
        (t) => t.sprintId === activeSprint.id && t.status === destination.droppableId
      );

      let insertIndex = newTasks.length;
      if (destination.index < destStatusTasks.length) {
        const targetTask = destStatusTasks[destination.index];
        insertIndex = newTasks.findIndex((t) => t.id === targetTask.id);
      } else if (destStatusTasks.length > 0) {
        const lastTask = destStatusTasks[destStatusTasks.length - 1];
        insertIndex = newTasks.findIndex((t) => t.id === lastTask.id) + 1;
      }

      newTasks.splice(insertIndex, 0, draggedTask);
      return newTasks;
    });

    // Appel API
    taskService.updateTaskStatus(draggableId, destination.droppableId, destination.index).catch((err) => {
      console.error('Erreur lors du changement de statut:', err);
    });
  };

  const handleAddTask = (statusId, title) => {
    if (!activeSprint) return;
    if (!title || title.trim() === "") return;

    const tempId = `MJ-TEMP-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title: title,
      priority: "medium",
      status: statusId,
      tags: ["feature"],
      points: 0,
      sprintId: activeSprint.id,
    };
    
    setTasks(prev => [...prev, optimisticTask]);

    taskService.createTask(activeSprint.id, title)
      .then(newTask => {
        // Mettre à jour avec la tâche reçue du serveur, mais en forçant le statut actuel
        setTasks(prev => prev.map(t => t.id === tempId ? { ...newTask, status: statusId } : t));
      })
      .catch(error => {
        console.error("Erreur lors de la création :", error);
        setTasks(prev => prev.filter(t => t.id !== tempId));
        alert("Impossible de créer le ticket.");
      });
  };

  const handleToggleAssignee = (assigneeName) => {
    setActiveAssignees((prev) => 
      prev.includes(assigneeName) 
        ? prev.filter(name => name !== assigneeName)
        : [...prev, assigneeName]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveAssignees([]);
  };

  const handleCompleteSprint = () => {
    if (window.confirm(`Voulez-vous vraiment clôturer le sprint "${activeSprint.name}" ?\nLes tâches non terminées pourront être réassignées.`)) {
      setSprints(prev => prev.map(s => 
        s.id === activeSprint.id ? { ...s, status: 'done' } : s
      ));
      // Optionnel : on pourrait aussi mettre à jour tous les tickets non "done" pour les basculer au backlog
      alert(`Le sprint "${activeSprint.name}" a été clôturé avec succès.`);
    }
  };

  if (!activeSprint) {
    return (
      <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira">
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Aucun sprint actif pour le moment.
        </div>
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
      />
      <div className="kanban-board-container scroll">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map((col) => {
              const colTasks = activeTasks.filter((t) => t.status === col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  title={col.title}
                  status={col.id}
                  tasks={colTasks}
                  onAddTask={handleAddTask}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </ProjectLayout>
  );
}
