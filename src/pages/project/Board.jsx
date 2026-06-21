import React, { useState, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProjectLayout from "../../components/layout/ProjectLayout";
import KanbanColumn from "../../components/board/KanbanColumn";
import BoardControlBar from "../../components/board/BoardControlBar";
import TaskDetailModal from "../../components/shared/TaskDetailModal";
import { taskService } from "../../services/taskService";
import { sprintService } from "../../services/sprintService";
import { projectService } from "../../services/projectService";
import ActionBtn from "../../components/ui/ActionBtn";
import { resolveRoles } from "../../services/roles";
import axios from "axios";
import "../../styles/Board/Board.css";

export default function Board() {
  const [activeTab, setActiveTab] = useState("board");
  const [activeSprint, setActiveSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [activeAssignees, setActiveAssignees] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // RBAC State
  const [isSM, setIsSM] = useState(false);
  const [isPO, setIsPO] = useState(false);
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = loggedInUser ? parseInt(loggedInUser.id, 10) : null;
  // Dev status requires actual team membership; the board is moved by the SM
  // (any card) or the Dev who owns the card. The PO does not move board cards.
  const boardRoles = resolveRoles(project, teamMembers, currentUserId);
  const isDev = boardRoles.isDev;
  const canDragOnBoard = boardRoles.isSM || boardRoles.isDev;

  useEffect(() => {
    const loadBoard = async () => {
      const rawId = localStorage.getItem("selectedProjectId");
      const projectId =
        rawId && rawId !== "undefined" && rawId !== "null"
          ? parseInt(rawId, 10)
          : 1;
      try {
        // 1. Load project to get columns (états) and roles
        const projectData = await projectService.getProjectById(projectId);

        // Compute RBAC
        const userString = localStorage.getItem("user");
        const loggedInUser = userString ? JSON.parse(userString) : null;
        const currentUserId = loggedInUser
          ? parseInt(loggedInUser.id, 10)
          : null;
        if (projectData && currentUserId) {
          setIsSM(parseInt(projectData.idSM, 10) === currentUserId);
          setIsPO(parseInt(projectData.idPO, 10) === currentUserId);
        } else {
          setIsSM(false);
          setIsPO(false);
        }
        setProject(projectData);

        // Store the project key for task ID formatting.
        if (projectData && projectData.cle) {
          localStorage.setItem('selectedProjectKey', projectData.cle);
        }

        // Fetch team members
        if (projectData && projectData.idTeam > 0) {
          try {
            const teamRes = await axios.get(
              `http://localhost:8080/Backend_PFA/GetTeam?id=${projectData.idTeam}`,
            );
            setTeamMembers(teamRes.data?.membres || []);
          } catch (err) {
            console.error("Error loading team members in Board:", err);
            setTeamMembers([]);
          }
        } else {
          setTeamMembers([]);
        }

        let colIds = [];
        if (projectData && projectData.etats && projectData.etats.length > 0) {
          colIds = projectData.etats.map((etat) => etat.trim());
          setColumns(colIds.map((id) => ({ id, title: id })));
        }

        // 2. Load sprints to find the active one
        const sprints = await sprintService.getAll(projectId);
        const active = sprints.find(
          (s) => s.status === "active" || s.status === "actif",
        );
        setActiveSprint(active || null);

        // 3. Load tasks for the active sprint using the optimized endpoint
        if (active) {
          const { tasks: sprintTasks, columns: sprintColumns } =
            await taskService.getSprintTasksAndColumns(active.id, projectId);

          // Use columns from project etats if available, otherwise from endpoint
          if (colIds.length === 0 && sprintColumns && sprintColumns.length > 0) {
            colIds = sprintColumns.map((c) => c.id);
            setColumns(sprintColumns);
          }

          // Map tasks to ensure their status matches one of the columns
          const defaultCol = colIds.length > 0 ? colIds[0] : "todo";
          const mappedTasks = sprintTasks.map((t) => {
            if (!colIds.includes(t.status)) {
              return { ...t, status: defaultCol };
            }
            return t;
          });
          setTasks(mappedTasks);
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
    // Workflow state (column) reordering — SM only.
    if (result.type === "COLUMN") {
      if (!isSM) return;
      const { source, destination } = result;
      if (!destination || source.index === destination.index) return;

      const newCols = Array.from(columns);
      const [moved] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, moved);
      setColumns(newCols);

      const rawId = localStorage.getItem("selectedProjectId");
      const projectId =
        rawId && rawId !== "undefined" && rawId !== "null"
          ? parseInt(rawId, 10)
          : 1;
      const etats = newCols.map((c) => c.title);
      projectService.updateProjectStates(projectId, etats).catch((err) => {
        console.error("Error reordering columns:", err);
        window.location.reload();
      });
      return;
    }

    const { source, destination, draggableId } = result;
    if (!canDragOnBoard) return;

    // Responsabilité collective : tout Dev peut déplacer n'importe quel
    // ticket de l'équipe sur le board (principe Agile).

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return prevTasks;
      const newTasks = [...prevTasks];
      const draggedTask = {
        ...newTasks[taskIndex],
        status: destination.droppableId,
      };
      newTasks.splice(taskIndex, 1);
      newTasks.splice(destination.index, 0, draggedTask);
      return newTasks;
    });

    taskService
      .updateTaskStatus(draggableId, destination.droppableId)
      .catch((err) => {
        console.error("Erreur lors du changement de statut:", err);
      });
  };

  const handleAddTask = (statusId, title) => {
    if (!activeSprint || !title.trim()) return;
    const tempId = `${(localStorage.getItem('selectedProjectKey') || 'MJ')}-TEMP-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title,
      priority: "medium",
      status: statusId,
      tags: ["feature"],
      points: 0,
      sprintId: activeSprint.id,
    };
    setTasks((prev) => [...prev, optimisticTask]);

    taskService
      .createTask(activeSprint.id, title, null, statusId)
      .then((newTask) =>
        setTasks((prev) =>
          prev.map((t) =>
            t.id === tempId ? { ...newTask, status: statusId } : t,
          ),
        ),
      )
      .catch(() => setTasks((prev) => prev.filter((t) => t.id !== tempId)));
  };

  const handleUpdateTask = (updatedTask) => {
    // Auto-save: persist and reflect locally, but keep the modal open.
    // The modal is only dismissed via its explicit close (X / overlay).
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    taskService.updateTask(updatedTask.id, updatedTask);
  };

  const handleDeleteTask = (taskId) => {
    taskService
      .deleteTask(taskId)
      .then(() => {
        setSelectedTaskId(null);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  const handleDeleteColumn = (statusId) => {
    const targetCol = columns.find((c) => c.id === statusId);
    if (!targetCol) return;

    const columnTasks = tasks.filter((t) => t.status === statusId);
    if (columnTasks.length > 0) {
      alert(
        "Impossible de supprimer un statut contenant des tickets. Déplacez d'abord les tickets.",
      );
      return;
    }

    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le statut "${targetCol.title}" ?`,
      )
    ) {
      return;
    }

    const updatedCols = columns.filter((c) => c.id !== statusId);
    setColumns(updatedCols);

    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;
    const etats = updatedCols.map((col) => col.title);

    projectService
      .updateProjectStates(projectId, etats)
      .then((res) => {
        if (res && res.message === "success") {
          const defaultCol =
            updatedCols.length > 0 ? updatedCols[0].id : "todo";
          setTasks((prev) =>
            prev.map((t) =>
              t.status === statusId ? { ...t, status: defaultCol } : t,
            ),
          );
        } else {
          alert("Erreur lors de la mise à jour des statuts.");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error("Error deleting column:", err);
        window.location.reload();
      });
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    const title = newColumnTitle.trim();
    const id = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (columns.some((col) => col.id === id)) return;

    const newColumns = [...columns, { id, title }];
    setColumns(newColumns);
    setIsAddingColumn(false);
    setNewColumnTitle("");

    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;
    const etats = newColumns.map((col) => col.title);
    await projectService.updateProjectStates(projectId, etats);
  };

  // --- FILTER & CONTROL HANDLERS ---
  const assignees = useMemo(() => {
    const uniqueMap = new Map();
    tasks.forEach((task) => {
      if (
        task.assignee &&
        task.assignee.name &&
        !uniqueMap.has(task.assignee.name)
      ) {
        uniqueMap.set(task.assignee.name, task.assignee);
      }
    });
    return Array.from(uniqueMap.values());
  }, [tasks]);

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Sub-tasks don't appear as cards on the board — they're shown as
      // progress indicators on their parent story's card.
      const type = task.tags && task.tags[0];
      if (type === "Subtask") return false;

      const matchesSearch =
        search === "" ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.id.toLowerCase().includes(search.toLowerCase());
      const matchesAssignee =
        activeAssignees.length === 0 ||
        (task.assignee && activeAssignees.includes(task.assignee.name));
      return matchesSearch && matchesAssignee;
    });
  }, [tasks, search, activeAssignees]);

  const handleToggleAssignee = (assigneeName) => {
    setActiveAssignees((prev) =>
      prev.includes(assigneeName)
        ? prev.filter((n) => n !== assigneeName)
        : [...prev, assigneeName],
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveAssignees([]);
  };

  const handleCompleteSprint = () => {
    if (
      window.confirm(
        `Voulez-vous vraiment clôturer le sprint "${activeSprint.name}" ?`,
      )
    ) {
      sprintService.updateStatus(activeSprint.id, "done").then(() => {
        alert(`Le sprint a été clôturé.`);
        window.location.reload(); // Quick MVP refresh
      });
    }
  };

  if (loading)
    return (
      <ProjectLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectName="Mini-Jira"
      >
        <div style={{ padding: "24px", textAlign: "center" }}>
          Chargement du board...
        </div>
      </ProjectLayout>
    );

  if (!activeSprint) {
    return (
      <ProjectLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectName="Mini-Jira"
      >
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "var(--color-text-secondary)",
          }}
        >
          Aucun sprint actif pour le moment.
        </div>
      </ProjectLayout>
    );
  }

  return (
    <ProjectLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      projectName="Mini-Jira"
    >
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
      <div className="kanban-board-container scroll">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="board-columns"
            direction="horizontal"
            type="COLUMN"
          >
            {(provided) => (
              <div
                className="kanban-board"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map((col, index) => (
                  <Draggable
                    key={col.id}
                    draggableId={`col-${col.id}`}
                    index={index}
                    isDragDisabled={!isSM}
                  >
                    {(prov) => (
                      <div
                        className="kanban-column-draggable"
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                      >
                        <KanbanColumn
                          title={col.title}
                          status={col.id}
                          tasks={activeTasks.filter((t) => t.status === col.id)}
                          allTasks={tasks}
                          onAddTask={handleAddTask}
                          onTaskClick={setSelectedTaskId}
                          isPO={isPO}
                          isSM={isSM}
                          isDragDisabled={!canDragOnBoard}
                          onDeleteColumn={handleDeleteColumn}
                          dragHandleProps={isSM ? prov.dragHandleProps : undefined}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {isSM && (
                  <div className="kanban-column-container add-column-wrapper">
                    {isAddingColumn ? (
                      <div className="add-column-form">
                        <input
                          type="text"
                          className="ui-input new-column-title-input"
                          placeholder="Nom du statut..."
                          value={newColumnTitle}
                          onChange={(e) => setNewColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddColumn();
                            else if (e.key === "Escape") setIsAddingColumn(false);
                          }}
                          autoFocus
                        />
                        <div className="add-column-actions">
                          <button
                            onClick={handleAddColumn}
                            className="add-column-save-btn"
                          >
                            Ajouter
                          </button>
                          <button
                            onClick={() => setIsAddingColumn(false)}
                            className="add-column-cancel-btn"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="add-column-trigger-btn"
                        onClick={() => setIsAddingColumn(true)}
                      >
                        <svg
                          className="kanban-add-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ marginRight: "6px" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Ajouter un statut
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
       {selectedTaskId && (
        <TaskDetailModal
          task={
            selectedTaskId === "NEW"
              ? {
                  id: "NEW",
                  title: "",
                  description: "",
                  status: columns.length > 0 ? columns[0].id : "todo",
                  priority: "medium",
                  tags: ["Feature"],
                  sprintId: activeSprint ? activeSprint.id : null,
                }
              : tasks.find((t) => t.id === selectedTaskId)
          }
          onClose={() => setSelectedTaskId(null)}
          onSave={
            selectedTaskId === "NEW"
              ? (taskData) => {
                  taskService.createDetailedTask(taskData).then(() => {
                    setSelectedTaskId(null);
                    window.location.reload();
                  });
                }
              : handleUpdateTask
          }
          onDelete={handleDeleteTask}
          columns={columns}
          project={project}
          teamMembers={teamMembers}
          sprints={activeSprint ? [activeSprint] : []}
        />
      )}
    </ProjectLayout>
  );
}
