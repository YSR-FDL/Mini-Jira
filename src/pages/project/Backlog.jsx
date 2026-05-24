import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import ProjectLayout from "../../components/layout/ProjectLayout";
import FilterBar from "../../components/backlog/FilterBar";
import SprintBlock from "../../components/backlog/SprintBlock";
import TaskDetailModal from "../../components/shared/TaskDetailModal";
import { initialSprints, initialTasks } from "../../data/projectsMockData";
import { taskService } from "../../services/taskService";

import "../../styles/Backlog.css";

export default function Backlog() {
  const [activeTab, setActiveTab] = useState("backlog");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  //  STATES DE LA DATA
  const [sprints] = useState(initialSprints);
  const [tasks, setTasks] = useState(initialTasks);

  // LOGIQUE METIER (Simule Backend via Service)
  const handleAddTask = (sprintId, title) => {
    // Création optimiste pour UI instantanée
    const tempId = `MJ-TEMP-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title: title,
      priority: "medium",
      status: "todo",
      tags: ["feature"],
      points: 0,
      sprintId: sprintId,
    };
    
    setTasks(prev => [...prev, optimisticTask]);

    taskService.createTask(sprintId, title)
      .then(newTask => {
        // Remplace la tâche temporaire par la vraie tâche du serveur
        setTasks(prev => prev.map(t => t.id === tempId ? newTask : t));
      })
      .catch(error => {
        console.error("Erreur lors de la création du ticket :", error);
        // En cas d'erreur on retire la tâche optimiste
        setTasks(prev => prev.filter(t => t.id !== tempId));
        alert("Impossible de créer le ticket. Veuillez réessayer.");
      });
  };

  const handleTagChange = (taskId, newTag, tagIndex) => {
    // Sauvegarde de l'état précédent pour le rollback
    const previousTask = tasks.find(t => t.id === taskId);

    // Mise à jour optimiste et instantanée (Dynamique)
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const newTags = [...(t.tags || [])];
          newTags[tagIndex] = newTag;
          return { ...t, tags: newTags };
        }
        return t;
      })
    );

    // Appel API en arrière-plan
    taskService.updateTaskTag(taskId, newTag, tagIndex).catch(error => {
      console.error("Erreur lors de la modification du tag", error);
      // Rollback en cas d'erreur
      setTasks(prev => prev.map(t => t.id === taskId ? previousTask : t));
      alert("Erreur lors de la modification du tag. L'état a été restauré.");
    });
  };

  const handleUpdateTask = (updatedTask) => {
    // Sauvegarde de l'état précédent pour le rollback
    const previousTask = tasks.find(t => t.id === updatedTask.id);

    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTaskId(null);

    taskService.updateTask(updatedTask.id, updatedTask).catch(err => {
      console.error("Erreur lors de la sauvegarde de la tâche", err);
      // Rollback en cas d'erreur
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? previousTask : t));
      alert("Échec de la mise à jour. La tâche a été restaurée à son état précédent.");
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Sauvegarde de l'état global des tâches avant le déplacement
    const previousTasks = [...tasks];

    setTasks((prevTasks) => {
      // 1. Trouver la tâche déplacée
      const taskIndex = prevTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return prevTasks;
      const draggedTask = { ...prevTasks[taskIndex] };

      // Si changement de sprint, on met à jour son sprintId
      if (source.droppableId !== destination.droppableId) {
        draggedTask.sprintId = destination.droppableId;
      }

      // 2. Retirer la tâche de l'ancien tableau
      const newTasks = [...prevTasks];
      newTasks.splice(taskIndex, 1);

      // 3. Trouver la bonne position d'insertion dans le tableau global
      const destSprintTasks = newTasks.filter(
        (t) => t.sprintId === destination.droppableId
      );

      let insertIndex = newTasks.length; // par défaut à la fin globale
      if (destination.index < destSprintTasks.length) {
        // La tâche qui occupera cette place
        const targetTask = destSprintTasks[destination.index];
        insertIndex = newTasks.findIndex((t) => t.id === targetTask.id);
      } else if (destSprintTasks.length > 0) {
        // À la fin du sprint de destination
        const lastTask = destSprintTasks[destSprintTasks.length - 1];
        insertIndex = newTasks.findIndex((t) => t.id === lastTask.id) + 1;
      }

      newTasks.splice(insertIndex, 0, draggedTask);
      return newTasks;
    });

    // Appel API en arrière-plan
    taskService
      .moveTask(draggableId, destination.droppableId, destination.index)
      .catch((error) => {
        console.error("Erreur lors du déplacement", error);
        // Rollback en cas d'erreur
        setTasks(previousTasks);
        alert("Impossible de déplacer le ticket. La position a été restaurée.");
      });
  };

  // STATES DES FILTRES ET TRI
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [sortConfig, setSortConfig] = useState(null);
  const [activeAssignees, setActiveAssignees] = useState([]);

  // Extraction des assignés uniques pour le backlog complet
  const assignees = React.useMemo(() => {
    const uniqueMap = new Map();
    tasks.forEach((task) => {
      if (task.assignee && task.assignee.name) {
        if (!uniqueMap.has(task.assignee.name)) {
          uniqueMap.set(task.assignee.name, task.assignee);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [tasks]);

  const handleToggleAssignee = (assigneeName) => {
    setActiveAssignees((prev) => 
      prev.includes(assigneeName) 
        ? prev.filter(name => name !== assigneeName)
        : [...prev, assigneeName]
    );
  };

  //   Filtrage:
  // recalculer la liste des tâches à chaque fois qu'on tape dans la recherche ou qu'on clique sur un chip
  const filteredTasks = tasks
    .filter((task) => {
      // Vérifier la recherche textuelle
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase());

      // Vérifier les chips (Feature, Bug, Tech)
      let matchesType = true;
      if (activeFilter !== "Toutes") {
        matchesType =
          task.tags &&
          task.tags.some(
            (tag) => tag.toLowerCase() === activeFilter.toLowerCase()
          );
      }

      // Filtre avatar
      const matchesAssignee = activeAssignees.length === 0 || 
        (task.assignee && activeAssignees.includes(task.assignee.name));

      return matchesSearch && matchesType && matchesAssignee;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      if (sortConfig.key === "points") {
        const pA = a.points || 0;
        const pB = b.points || 0;
        return sortConfig.direction === "asc" ? pA - pB : pB - pA;
      }

      if (sortConfig.key === "priority") {
        const priorityValues = { critical: 4, high: 3, medium: 2, low: 1 };
        const vA = priorityValues[a.priority?.toLowerCase()] || 0;
        const vB = priorityValues[b.priority?.toLowerCase()] || 0;
        return sortConfig.direction === "asc" ? vA - vB : vB - vA;
      }

      return 0;
    });

  return (
    <ProjectLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      projectName="Mini-Jira"
    >
      {/* BARRE DE FILTRES */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        assignees={assignees}
        activeAssignees={activeAssignees}
        onToggleAssignee={handleToggleAssignee}
      />

      {/* EN-TÊTE ET ACTIONS DES SPRINTS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <button
          className="btn-xs blue"
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          + Créer un sprint
        </button>
      </div>

      {/* LISTE DES SPRINTS */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}
          className="scroll"
        >
          {sprints.map((sprint) => {
            const sprintTasks = filteredTasks.filter(
              (t) => t.sprintId === sprint.id
            );

            return (
              <SprintBlock
                key={sprint.id}
                sprint={sprint}
                sprintTasks={sprintTasks}
                sortConfig={sortConfig}
                onAddTask={handleAddTask}
                onTagChange={handleTagChange}
                onTaskClick={setSelectedTaskId}
              />
            );
          })}
        </div>
      </DragDropContext>

      {selectedTaskId && (
        <TaskDetailModal 
          task={tasks.find(t => t.id === selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          onSave={handleUpdateTask}
        />
      )}
    </ProjectLayout>
  );
}
