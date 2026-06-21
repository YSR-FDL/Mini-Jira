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
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import "../../styles/Backlog/Backlog.css";
import "../../styles/Project/Sprints.css";

export default function Backlog() {
  const [activeTab, setActiveTab] = useState("backlog");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [sortConfig, setSortConfig] = useState(null);
  const [activeAssignees, setActiveAssignees] = useState([]);
  const [columns, setColumns] = useState([]);

  // RBAC & Sprint States
  const [isSM, setIsSM] = useState(false);
  const [isPO, setIsPO] = useState(false);
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [activeSprint, setActiveSprint] = useState(null);
  const [completedSprints, setCompletedSprints] = useState([]);
  const [moveToDest, setMoveToDest] = useState("backlog");

  const fetchData = async () => {
    setLoading(true);
    const rawId = localStorage.getItem("selectedProjectId");
    const projectId =
      rawId && rawId !== "undefined" && rawId !== "null"
        ? parseInt(rawId, 10)
        : 1;

    try {
      const tasksData = await taskService.getProjectTasks(projectId);
      const sprintsData = await sprintService.getAll(projectId);
      const projectData = await projectService.getProjectById(projectId);

      setTasks(tasksData);
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
          console.error("Error loading team members in Backlog:", err);
          setTeamMembers([]);
        }
      } else {
        setTeamMembers([]);
      }

      // Compute RBAC
      const userString = localStorage.getItem("user");
      const loggedInUser = userString ? JSON.parse(userString) : null;
      const currentUserId = loggedInUser ? parseInt(loggedInUser.id, 10) : null;
      if (projectData && currentUserId) {
        setIsSM(parseInt(projectData.idSM, 10) === currentUserId);
        setIsPO(parseInt(projectData.idPO, 10) === currentUserId);
      } else {
        setIsSM(false);
        setIsPO(false);
      }

      // Partition sprints
      const active = sprintsData.find(
        (s) => s.status === "active" || s.status === "actif",
      );
      const upcoming = sprintsData.filter(
        (s) =>
          s.status === "planned" ||
          s.status === "upcoming" ||
          s.status === "a venir",
      );
      const completed = sprintsData.filter(
        (s) =>
          s.status === "completed" ||
          s.status === "archive" ||
          s.status === "terminee" ||
          s.status === "terminé",
      );

      setActiveSprint(active || null);

      // Populate completed sprint tasks details
      completed.forEach((s) => {
        const sTasks = tasksData.filter(
          (t) => String(t.sprintId) === String(s.id),
        );
        s.completedIssuesCount = sTasks.filter(
          (i) => i.status === "done",
        ).length;
        s.totalPoints = sTasks
          .filter((i) => i.status === "done")
          .reduce((acc, i) => acc + (i.points || 0), 0);
      });
      setCompletedSprints(completed);

      const backlogContainer = { id: null, name: "Backlog", status: "active" };
      const activeAndUpcoming = [];
      if (active) activeAndUpcoming.push(active);
      activeAndUpcoming.push(...upcoming);

      setSprints([...activeAndUpcoming, backlogContainer]);

      if (projectData && projectData.etats) {
        setColumns(
          projectData.etats.map((etat) => ({
            id: etat.trim(),
            title: etat.trim(),
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching backlog data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS SPRINT ---
  const handleCreateSprintConfirm = (sprintData) => {
    const rawId = localStorage.getItem("selectedProjectId");
    const newSprint = {
      ...sprintData,
      status: "a venir",
      idProject:
        rawId && rawId !== "undefined" && rawId !== "null"
          ? parseInt(rawId, 10)
          : 1,
    };
    sprintService.create(newSprint).then(() => {
      setIsSprintModalOpen(false);
      fetchData(); // Recharge les données
    });
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
  };

  const handleUpdateSprintConfirm = (sprintData) => {
    sprintService
      .update(sprintData)
      .then(() => {
        setEditingSprint(null);
        fetchData();
      })
      .catch((err) => {
        console.error("Error updating sprint:", err);
        const msg =
          err?.response?.data?.error || "Impossible de modifier le sprint.";
        alert(msg);
      });
  };

  const handleStartSprint = (sprintId) => {
    if (activeSprint) {
      alert("Impossible de démarrer, un sprint est déjà actif.");
      return;
    }
    sprintService
      .updateStatus(sprintId, "active")
      .then(() => {
        fetchData();
      })
      .catch((err) => {
        console.error("Error starting sprint:", err);
        const msg =
          err?.response?.data?.error ||
          "Impossible de démarrer le sprint.";
        alert(msg);
      });
  };

  const handleOpenTerminateModal = () => {
    setIsTerminateModalOpen(true);
    setMoveToDest("backlog");
  };

  const handleTerminateSprintSubmit = (e) => {
    e.preventDefault();
    if (!activeSprint) return;

    sprintService
      .updateStatus(activeSprint.id, "completed")
      .then(() => {
        const activeSprintTasks = tasks.filter(
          (t) => String(t.sprintId) === String(activeSprint.id),
        );
        const incompleteIssues = activeSprintTasks.filter(
          (i) => i.status !== columns[columns.length - 1]?.id && i.status !== "done",
        );

        if (incompleteIssues.length === 0) {
          setIsTerminateModalOpen(false);
          fetchData();
          return;
        }

        const destSprintId =
          moveToDest === "backlog"
            ? null
            : moveToDest.split("upcoming-")[1];

        const taskIds = incompleteIssues.map((issue) => issue.id);
        taskService.batchMoveTasks(taskIds, destSprintId).then(() => {
          setIsTerminateModalOpen(false);
          fetchData();
        });
      })
      .catch((err) => {
        console.error("Error terminating sprint:", err);
      });
  };

  const handleDeleteSprint = (sprintId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sprint ?")) {
      sprintService
        .delete(sprintId)
        .then(() => {
          fetchData();
        })
        .catch((err) => {
          console.error("Error deleting sprint:", err);
        });
    }
  };

  const upcomingSprints = useMemo(() => {
    return sprints.filter(
      (s) =>
        s.id !== null &&
        s.id !== "backlog" &&
        (s.status === "planned" ||
          s.status === "upcoming" ||
          s.status === "a venir"),
    );
  }, [sprints]);

  // --- ACTIONS TASK ---
  const handleAddTask = (sprintId, title) => {
    const defaultStatus =
      columns && columns.length > 0 ? columns[0].id : "todo";
    taskService
      .createTask(sprintId, title, null, defaultStatus)
      .then(() => fetchData());
  };

  const handleSaveDetailedTask = (taskData) => {
    if (taskData.id === "NEW") {
      taskService.createDetailedTask(taskData).then(() => {
        setSelectedTaskId(null);
        fetchData();
      });
    } else {
      // Auto-save from the modal: persist and update local state in place.
      // Don't close or full-refetch, so the modal stays open while editing.
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)),
      );
      taskService.updateTask(taskData.id, taskData).catch((err) => {
        console.error("Error updating task:", err);
      });
    }
  };

  const handleTagChange = (taskId, newTag, tagIndex) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, tags: [newTag] };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    taskService
      .updateTask(taskId, updatedTask)
      .then(() => fetchData())
      .catch((err) => {
        console.error("Error updating tag:", err);
        fetchData();
      });
  };

  const handlePriorityChange = (taskId, newPriority) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, priority: newPriority };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    taskService
      .updateTask(taskId, updatedTask)
      .then(() => fetchData())
      .catch((err) => {
        console.error("Error updating priority:", err);
        fetchData();
      });
  };

  const handleDeleteTask = (taskId) => {
    taskService
      .deleteTask(taskId)
      .then(() => {
        setSelectedTaskId(null);
        fetchData();
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // RBAC check:
    if (isSM || isPO) {
      // SM et PO finalisent le sprint backlog : ils peuvent déplacer les stories
      // entre le backlog et les sprints (RACI : PO=R, SM=A).
    } else {
      // Dev et Admin ne peuvent pas réorganiser le backlog/sprints.
      return;
    }

    const sameList = destination.droppableId === source.droppableId;
    if (sameList && destination.index === source.index) return;

    const targetSprintId =
      destination.droppableId === "null" || destination.droppableId === "backlog"
        ? null
        : parseInt(destination.droppableId, 10);

    // When search/assignee filters are active, the drop index maps to a
    // filtered subset, so we can't reliably persist absolute order. Fall back
    // to a membership-only move in that case.
    const filtersActive = search.trim() !== "" || activeAssignees.length > 0;
    if (filtersActive) {
      if (sameList) return;
      taskService.moveTask(draggableId, destination.droppableId).then(() => fetchData());
      return;
    }

    const norm = (s) =>
      s === null || s === undefined || s === "null" ? null : parseInt(s, 10);
    const inDest = (t) => norm(t.sprintId) === targetSprintId;

    const dragged = tasks.find((t) => t.id === draggableId);
    if (!dragged) return;
    const updatedDragged = { ...dragged, sprintId: targetSprintId };

    const without = tasks.filter((t) => t.id !== draggableId);
    const destItems = without.filter(inDest);
    destItems.splice(destination.index, 0, updatedDragged);
    const others = without.filter((t) => !inDest(t));

    // Optimistic update: new order + sprint membership.
    setTasks([...others, ...destItems]);

    const orderedIds = destItems.map((t) => t.id);
    taskService.reorderTasks(orderedIds, targetSprintId).catch((err) => {
      console.error("Error reordering tasks:", err);
      fetchData();
    });
  };

  // --- FILTRES ---
  const assignees = useMemo(() => {
    const uniqueMap = new Map();
    tasks.forEach((task) => {
      if (task.assignee && task.assignee.name)
        uniqueMap.set(task.assignee.name, task.assignee);
    });
    return Array.from(uniqueMap.values());
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    // Les epics (conteneurs) et les sous-tâches (gérées dans leur story parente)
    // ne s'affichent pas dans le backlog/sprints.
    const type = task.tags && task.tags[0];
    if (type === "Epic" || type === "Subtask") return false;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      activeFilter === "Toutes" ||
      (task.tags &&
        task.tags.some(
          (tag) => tag.toLowerCase() === activeFilter.toLowerCase(),
        ));
    const matchesAssignee =
      activeAssignees.length === 0 ||
      (task.assignee && activeAssignees.includes(task.assignee.name));
    return matchesSearch && matchesType && matchesAssignee;
  });

  if (loading) return <div>Chargement...</div>;

  return (
    <ProjectLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      projectName="Mini-Jira Agile"
    >
      <FilterBar
        search={search}
        onSearch={setSearch}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        assignees={assignees}
        activeAssignees={activeAssignees}
        onToggleAssignee={(a) =>
          setActiveAssignees((prev) =>
            prev.includes(a) ? prev.filter((n) => n !== a) : [...prev, a],
          )
        }
      />

      {/* BOUTONS D'ACTION */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        {isPO && (
          <ActionBtn
            size="sm"
            variant="secondary"
            onClick={() => setSelectedTaskId("NEW")}
          >
            + Créer un ticket
          </ActionBtn>
        )}
        {isSM && (
          <ActionBtn
            size="sm"
            variant="primary"
            onClick={() => setIsSprintModalOpen(true)}
          >
            + Créer un sprint
          </ActionBtn>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}
          className="scroll"
        >
          {sprints.map((sprint) => {
            const sprintIdCheck = sprint.id === null ? null : String(sprint.id);
            let sprintTasks = filteredTasks.filter(
              (t) =>
                String(t.sprintId) === sprintIdCheck ||
                (t.sprintId === null && sprint.id === null),
            );

            if (sortConfig) {
              sprintTasks.sort((a, b) => {
                let valA, valB;
                if (sortConfig.key === "priority") {
                  const pMap = {
                    highest: 4,
                    high: 3,
                    medium: 2,
                    low: 1,
                    lowest: 0,
                  };
                  valA = pMap[a.priority?.toLowerCase()] || 0;
                  valB = pMap[b.priority?.toLowerCase()] || 0;
                } else if (sortConfig.key === "points") {
                  valA = a.points || 0;
                  valB = b.points || 0;
                }

                if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
                if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
              });
            }

            return (
              <SprintBlock
                key={sprint.id || "backlog"}
                sprint={{ ...sprint, id: sprintIdCheck || "null" }}
                sprintTasks={sprintTasks}
                sortConfig={sortConfig}
                onAddTask={handleAddTask}
                onTagChange={isPO ? handleTagChange : undefined}
                onPriorityChange={isPO ? handlePriorityChange : undefined}
                onTaskClick={setSelectedTaskId}
                isSM={isSM}
                isPO={isPO}
                onStartClick={handleStartSprint}
                onTerminateClick={handleOpenTerminateModal}
                onDeleteClick={handleDeleteSprint}
                onEditClick={handleEditSprint}
              />
            );
          })}

          {/* COMPLETED SPRINTS */}
          {completedSprints.length > 0 && (
            <div
              className="sprints-section"
              style={{ marginTop: "48px", opacity: 0.8 }}
            >
              <h2
                className="section-heading"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
              >
                {isCompletedCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                Sprints terminés{" "}
                <span className="badge">{completedSprints.length}</span>
              </h2>

              {!isCompletedCollapsed &&
                completedSprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="sprint-card"
                    style={{
                      padding: "16px 24px",
                      marginBottom: "12px",
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border-secondary)",
                    }}
                  >
                    <div
                      className="sprint-card-header"
                      style={{
                        margin: 0,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="sprint-info">
                        <div
                          className="sprint-name"
                          style={{ fontSize: "16px", fontWeight: "bold" }}
                        >
                          {sprint.name}
                        </div>
                        <div
                          className="sprint-meta"
                          style={{
                            display: "flex",
                            gap: "12px",
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <span
                            className="sprint-status-badge status-completed"
                            style={{
                              background: "#F4F5F7",
                              color: "#505F79",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            Terminé
                          </span>
                          <span>
                            {sprint.startDate} - {sprint.endDate}
                          </span>
                          <span>
                            {sprint.completedIssuesCount} tickets terminés (
                            {sprint.totalPoints} pts)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DragDropContext>

      {/* MODALE TICKET */}
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
                  sprintId: null,
                }
              : tasks.find((t) => t.id === selectedTaskId)
          }
          onClose={() => setSelectedTaskId(null)}
          onSave={handleSaveDetailedTask}
          onDelete={handleDeleteTask}
          columns={columns}
          project={project}
          teamMembers={teamMembers}
          sprints={sprints}
        />
      )}

      {/* MODALE SPRINT */}
      {isSprintModalOpen && (
        <CreateSprintModal
          onClose={() => setIsSprintModalOpen(false)}
          onSave={handleCreateSprintConfirm}
        />
      )}

      {/* MODALE EDITION SPRINT */}
      {editingSprint && (
        <CreateSprintModal
          sprint={editingSprint}
          onClose={() => setEditingSprint(null)}
          onSave={handleUpdateSprintConfirm}
        />
      )}

      {/* MODALE TERMINATE SPRINT */}
      {isTerminateModalOpen && activeSprint && (
        <div
          className="sprints-modal-overlay"
          onClick={() => setIsTerminateModalOpen(false)}
        >
          <div
            className="sprints-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sprints-modal-header">
              Terminer le sprint : {activeSprint.name}
            </div>
            <form onSubmit={handleTerminateSprintSubmit}>
              <div className="sprints-modal-body">
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Ce sprint contient{" "}
                  <strong>
                    {
                      tasks.filter(
                        (t) =>
                          String(t.sprintId) === String(activeSprint.id) &&
                          t.status !== "done",
                      ).length
                    }
                  </strong>{" "}
                  ticket(s) non terminé(s).
                  <br />
                  <br />
                  Où souhaitez-vous déplacer les tickets non terminés ?
                </p>
                <div className="form-group-sprint">
                  <label>Déplacer vers</label>
                  <select
                    value={moveToDest}
                    onChange={(e) => setMoveToDest(e.target.value)}
                    className="ui-input"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid var(--color-border-secondary)",
                    }}
                  >
                    <option value="backlog">Nouveau backlog</option>
                    {upcomingSprints.map((sprint) => (
                      <option key={sprint.id} value={`upcoming-${sprint.id}`}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sprints-modal-footer">
                <ActionBtn
                  variant="secondary"
                  onClick={() => setIsTerminateModalOpen(false)}
                >
                  Annuler
                </ActionBtn>
                <ActionBtn variant="primary" type="submit">
                  Terminer le sprint
                </ActionBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProjectLayout>
  );
}
