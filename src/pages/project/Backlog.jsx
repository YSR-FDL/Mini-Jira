import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import ProjectLayout from "../../components/layout/ProjectLayout";
import FilterBar from "../../components/backlog/FilterBar";
import SprintBlock from "../../components/backlog/SprintBlock";
import TaskDetailModal from "../../components/shared/TaskDetailModal";
import ActionBtn from "../../components/ui/ActionBtn";
import { taskService } from "../../services/taskService";
import { sprintService } from "../../services/sprintService";
import { projectService } from "../../services/projectService";
import CreateSprintModal from "../../components/sprints/CreateSprintModal";
import "../../styles/Backlog/Backlog.css";

export default function Backlog() {
  const [activeTab, setActiveTab] = useState("backlog");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [sortConfig, setSortConfig] = useState(null);
  const [activeAssignees, setActiveAssignees] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const rawId = localStorage.getItem('selectedProjectId');
    const projectId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1;
    
    try {
      const tasksData = await taskService.getProjectTasks(projectId);
      const sprintsData = await sprintService.getAll(projectId);
      const projectData = await projectService.getProjectById(projectId);
      
      setTasks(tasksData);
      
      const backlogContainer = { id: null, name: "Backlog", status: "active" };
      setSprints([...sprintsData, backlogContainer]);
      
      if (projectData && projectData.etats) {
        setColumns(projectData.etats.map(etat => ({ id: etat.trim(), title: etat.trim() })));
      }
    } catch (error) {
      console.error("Error fetching backlog data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS SPRINT ---
  const handleCreateSprintConfirm = (sprintData) => {
    const rawId = localStorage.getItem('selectedProjectId');
    const newSprint = { 
        ...sprintData, 
        status: "a venir", 
        idProject: (rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1 
    };
    sprintService.create(newSprint).then(() => {
      setIsSprintModalOpen(false);
      fetchData(); // Recharge les données
    });
  };

  // --- ACTIONS TASK ---
  const handleAddTask = (sprintId, title) => {
    taskService.createTask(sprintId, title).then(() => fetchData());
  };

  const handleSaveDetailedTask = (taskData) => {
    if (taskData.id === 'NEW') {
      taskService.createDetailedTask(taskData).then(() => {
        setSelectedTaskId(null);
        fetchData();
      });
    } else {
      taskService.updateTask(taskData.id, taskData).then(() => {
        setSelectedTaskId(null);
        fetchData();
      });
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    // UI Optimiste
    const draggedTask = tasks.find(t => t.id === draggableId);
    if(draggedTask) draggedTask.sprintId = destination.droppableId === "null" ? null : parseInt(destination.droppableId);

    taskService.moveTask(draggableId, destination.droppableId).then(() => fetchData());
  };

  // --- FILTRES ---
  const assignees = useMemo(() => {
    const uniqueMap = new Map();
    tasks.forEach(task => { if (task.assignee && task.assignee.name) uniqueMap.set(task.assignee.name, task.assignee); });
    return Array.from(uniqueMap.values());
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "Toutes" || (task.tags && task.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()));
    const matchesAssignee = activeAssignees.length === 0 || (task.assignee && activeAssignees.includes(task.assignee.name));
    return matchesSearch && matchesType && matchesAssignee;
  });

  if (loading) return <div>Chargement...</div>;

  return (
      <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab} projectName="Mini-Jira Agile">
        <FilterBar search={search} onSearch={setSearch} activeFilter={activeFilter} onFilter={setActiveFilter} sortConfig={sortConfig} onSortChange={setSortConfig} assignees={assignees} activeAssignees={activeAssignees} onToggleAssignee={(a) => setActiveAssignees(prev => prev.includes(a) ? prev.filter(n => n !== a) : [...prev, a])} />

        {/* BOUTONS D'ACTION */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "16px" }}>
          <ActionBtn size="sm" variant="secondary" onClick={() => setSelectedTaskId('NEW')}>+ Créer un ticket</ActionBtn>
          <ActionBtn size="sm" variant="primary" onClick={() => setIsSprintModalOpen(true)}>+ Créer un sprint</ActionBtn>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }} className="scroll">
            {sprints.map((sprint) => {
              const sprintIdCheck = sprint.id === null ? null : String(sprint.id);
              let sprintTasks = filteredTasks.filter((t) => String(t.sprintId) === sprintIdCheck || (t.sprintId === null && sprint.id === null));
              
              if (sortConfig) {
                  sprintTasks.sort((a, b) => {
                      let valA, valB;
                      if (sortConfig.key === 'priority') {
                          const pMap = { highest: 4, high: 3, medium: 2, low: 1, lowest: 0 };
                          valA = pMap[a.priority?.toLowerCase()] || 0;
                          valB = pMap[b.priority?.toLowerCase()] || 0;
                      } else if (sortConfig.key === 'points') {
                          valA = a.points || 0;
                          valB = b.points || 0;
                      }
                      
                      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                      return 0;
                  });
              }
              
              return (
                  <SprintBlock key={sprint.id || 'backlog'} sprint={{...sprint, id: sprintIdCheck || "null"}} sprintTasks={sprintTasks} sortConfig={sortConfig} onAddTask={handleAddTask} onTagChange={() => {}} onTaskClick={setSelectedTaskId} />
              );
            })}
          </div>
        </DragDropContext>

        {/* MODALE TICKET */}
        {selectedTaskId && (
            <TaskDetailModal
                task={selectedTaskId === 'NEW' ? { id: 'NEW', title: '', description: '', status: columns.length > 0 ? columns[0].id : 'todo', priority: 'medium', tags: ['Feature'], sprintId: null } : tasks.find(t => t.id === selectedTaskId)}
                onClose={() => setSelectedTaskId(null)}
                onSave={handleSaveDetailedTask}
                columns={columns}
            />
        )}

        {/* MODALE SPRINT */}
        {isSprintModalOpen && (
            <CreateSprintModal 
                onClose={() => setIsSprintModalOpen(false)} 
                onSave={handleCreateSprintConfirm} 
            />
        )}
      </ProjectLayout>
  );
}