import axios from 'axios';
import { getRequesterId } from './authHelper';

const API_BASE_URL = 'http://localhost:8080/Backend_PFA';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const taskService = {
    // --- READ ---
    getProjectTasks: async (projectId) => {
        try {
            const response = await axiosInstance.get(`/GetProjectTasks?projectId=${projectId}`);
            return response.data.map(t => ({
                id: `MJ-${t.idTask}`, title: t.titre, description: t.description,
                status: t.statut, priority: t.priorite, points: t.storyPoints,
                tags: t.typeTache ? [t.typeTache] : ['Feature'], assignee: t.assignee,
                sprintId: t.idSprint !== undefined ? t.idSprint : null,
                parentId: t.idParent !== undefined ? t.idParent : null
            }));
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return [];
        }
    },

    getSprintTasksAndColumns: async (sprintId, projectId) => {
        try {
            const response = await axiosInstance.get(`/GetSprintTasks?sprintId=${sprintId}&projectId=${projectId}`);
            const formattedTasks = response.data.tasks.map(t => ({
                id: `MJ-${t.idTask}`, title: t.titre, description: t.description,
                status: t.statut, priority: t.priorite, points: t.storyPoints,
                tags: t.typeTache ? [t.typeTache] : ['Feature'], assignee: t.assignee,
                sprintId: sprintId !== undefined ? sprintId : null,
                parentId: t.idParent !== undefined ? t.idParent : null
            }));
            return { tasks: formattedTasks, columns: response.data.columns };
        } catch (error) {
            console.error("Error fetching sprint board data:", error);
            return { tasks: [], columns: [] };
        }
    },

    // --- CREATE ---
    createTask: async (sprintId, title, projectId = null, status = 'todo') => {
        const rawId = localStorage.getItem('selectedProjectId');
        const currentProjectId = projectId || ((rawId && rawId !== 'undefined' && rawId !== 'null') ? parseInt(rawId, 10) : 1);
        const parsedSprintId = (sprintId === 'null' || sprintId === null) ? null : parseInt(sprintId, 10);
        const payload = { titre: title, idSprint: parsedSprintId, idProject: currentProjectId, statut: status, priorite: 'medium', typeTache: 'Feature', storyPoints: 0, requesterId: getRequesterId() };
        const response = await axiosInstance.post('/CreateTask', payload);
        if (response.data.message === 'success') {
            const realId = response.data.idTask ? `MJ-${response.data.idTask}` : `MJ-TEMP-${Date.now()}`;
            return { id: realId, title: title, tags: ['Feature'], priority: 'medium', status: status, sprintId: parsedSprintId, points: 0, assignee: null };
        }
        throw new Error("Failed to create task");
    },

    createDetailedTask: async (taskData) => {
        const rawSprintId = (taskData.sprintId === 'null' || taskData.sprintId === null) ? null : parseInt(taskData.sprintId, 10);
        const payload = {
            titre: taskData.title || 'Nouvelle tâche',
            description: taskData.description || '',
            idSprint: rawSprintId,
            idProject: taskData.projectId || ((localStorage.getItem('selectedProjectId') && localStorage.getItem('selectedProjectId') !== 'undefined' && localStorage.getItem('selectedProjectId') !== 'null') ? parseInt(localStorage.getItem('selectedProjectId'), 10) : 1),
            statut: taskData.status || 'todo',
            priorite: taskData.priority || 'medium',
            typeTache: taskData.tags && taskData.tags.length > 0 ? taskData.tags[0] : 'Feature',
            storyPoints: taskData.points || 0,
            idParent: (taskData.parentId === undefined || taskData.parentId === null || taskData.parentId === 'null') ? null : parseInt(taskData.parentId, 10),
            requesterId: getRequesterId()
        };
        const response = await axiosInstance.post('/CreateTask', payload);
        return response.data.message === 'success';
    },

    // --- UPDATE ---
    updateTaskStatus: async (taskId, newStatus) => {
        const rawId = parseInt(taskId.toString().replace('MJ-', ''), 10);
        const response = await axiosInstance.post('/MoveTask', { taskId: rawId, newStatus: newStatus, requesterId: getRequesterId() });
        return response.data.message === 'success';
    },

    updateTask: async (taskId, updatedData) => {
        const rawId = parseInt(taskId.toString().replace('MJ-', ''), 10);
        
        let idAssignee = null;
        if (updatedData.assignee) {
            if (typeof updatedData.assignee === 'object' && updatedData.assignee.id) {
                idAssignee = parseInt(updatedData.assignee.id, 10);
            } else if (typeof updatedData.assignee === 'number') {
                idAssignee = updatedData.assignee;
            } else if (typeof updatedData.assignee === 'string') {
                idAssignee = parseInt(updatedData.assignee, 10);
            }
        }

        const payload = { 
            idTask: rawId, 
            titre: updatedData.title, 
            description: updatedData.description, 
            statut: updatedData.status, 
            priorite: updatedData.priority, 
            typeTache: updatedData.tags ? updatedData.tags[0] : 'Feature', 
            storyPoints: updatedData.points,
            idSprint: (updatedData.sprintId !== undefined && updatedData.sprintId !== null && updatedData.sprintId !== 'null') ? parseInt(updatedData.sprintId, 10) : null,
            idAssignee: idAssignee,
            requesterId: getRequesterId()
        };
        // Hiérarchie : inclure idParent uniquement s'il est explicitement fourni.
        // null = détacher de l'epic ; absent = conserver le parent actuel (sémantique
        // de présence côté backend).
        if (updatedData.parentId !== undefined) {
            payload.idParent = (updatedData.parentId === null || updatedData.parentId === 'null')
                ? null
                : parseInt(updatedData.parentId, 10);
        }
        const response = await axiosInstance.post('/UpdateTask', payload);
        return response.data.message === 'success';
    },

    moveTask: async (taskId, newSprintId) => {
        const rawTaskId = parseInt(taskId.toString().replace('MJ-', ''), 10);
        const targetSprint = (newSprintId === null || newSprintId === 'null' || newSprintId === 'backlog') ? null : parseInt(newSprintId, 10);
        const response = await axiosInstance.post('/AssignTaskToSprint', { taskId: rawTaskId, sprintId: targetSprint, requesterId: getRequesterId() });
        return response.data.message === 'success';
    },

    updateTaskTag: async (taskId, newTag, tagIndex = 0) => {
        console.warn("[API] Tags are updated via full updateTask now.");
        return Promise.resolve(true);
    },

    deleteTask: async (taskId) => {
        try {
            const rawId = parseInt(taskId.toString().replace('MJ-', ''), 10);
            const response = await axiosInstance.post('/DeleteTask', { taskId: rawId, requesterId: getRequesterId() });
            return response.data.message === 'success';
        } catch (error) {
            console.error("Error deleting task:", error);
            return false;
        }
    },

    batchMoveTasks: async (taskIds, sprintId) => {
        try {
            const rawIds = taskIds.map(id => parseInt(id.toString().replace('MJ-', ''), 10));
            const targetSprint = (sprintId === null || sprintId === 'null' || sprintId === 'backlog') ? null : parseInt(sprintId, 10);
            const response = await axiosInstance.post('/BatchMoveTasksToSprint', { taskIds: rawIds, sprintId: targetSprint, requesterId: getRequesterId() });
            return response.data;
        } catch (error) {
            console.error("Error batch moving tasks:", error);
            return null;
        }
    },

    // Persist the order of a container (backlog or sprint). taskIds is the
    // ordered list of task ids; sprintId is the target container (null = backlog).
    reorderTasks: async (taskIds, sprintId) => {
        try {
            const rawIds = taskIds.map(id => parseInt(id.toString().replace('MJ-', ''), 10));
            const targetSprint = (sprintId === null || sprintId === 'null' || sprintId === 'backlog') ? null : parseInt(sprintId, 10);
            const response = await axiosInstance.post('/ReorderTasks', { taskIds: rawIds, sprintId: targetSprint, requesterId: getRequesterId() });
            return response.data;
        } catch (error) {
            console.error("Error reordering tasks:", error);
            return null;
        }
    }
};