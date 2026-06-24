import axios from 'axios';
import { getRequesterId } from './authHelper';

const API_BASE_URL = 'http://localhost:8080/Backend_PFA';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/** Extracts the numeric task id from a prefixed id like "CORE-14". */
const toRawId = (id) => parseInt(String(id).replace(/^[A-Z]+-/, ''), 10);

/** Returns the project key from localStorage, defaulting to 'MJ'. */
const getProjectKey = () => {
    try {
        const key = localStorage.getItem('selectedProjectKey');
        if (key && key !== 'undefined' && key !== 'null') return key;
    } catch (e) { /* ignore */ }
    return 'MJ';
};

export const taskService = {
    // --- READ ---
    getProjectTasks: async (projectId) => {
        try {
            const response = await axiosInstance.get(`/GetProjectTasks?projectId=${projectId}`);
            const key = getProjectKey();
            return response.data.map(t => ({
                id: `${key}-${t.idTask}`, title: t.titre, description: t.description,
                status: t.statut, priority: t.priorite, points: t.storyPoints,
                tags: t.typeTache ? [t.typeTache] : ['Feature'], assignee: t.assignee,
                sprintId: t.idSprint !== undefined ? t.idSprint : null,
                parentId: t.idParent !== undefined ? t.idParent : null,
                deliverableLink: t.lienLivrable !== undefined ? t.lienLivrable : null,
                poValidation: t.poValidation || 'NONE'
            }));
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return [];
        }
    },

    getSprintTasksAndColumns: async (sprintId, projectId) => {
        try {
            const response = await axiosInstance.get(`/GetSprintTasks?sprintId=${sprintId}&projectId=${projectId}`);
            const key = getProjectKey();
            const formattedTasks = response.data.tasks.map(t => ({
                id: `${key}-${t.idTask}`, title: t.titre, description: t.description,
                status: t.statut, priority: t.priorite, points: t.storyPoints,
                tags: t.typeTache ? [t.typeTache] : ['Feature'], assignee: t.assignee,
                sprintId: sprintId !== undefined ? sprintId : null,
                parentId: t.idParent !== undefined ? t.idParent : null,
                deliverableLink: t.lienLivrable !== undefined ? t.lienLivrable : null,
                poValidation: t.poValidation || 'NONE'
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
            const key = getProjectKey();
            const realId = response.data.idTask ? `${key}-${response.data.idTask}` : `${key}-TEMP-${Date.now()}`;
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
        const rawId = toRawId(taskId);
        const response = await axiosInstance.post('/MoveTask', { taskId: rawId, newStatus: newStatus, requesterId: getRequesterId() });
        return response.data.message === 'success';
    },

    // Dépôt du livrable (lien GitHub) d'une sous-tâche par le développeur propriétaire.
    submitDeliverable: async (taskId, deliverableLink) => {
        const rawId = toRawId(taskId);
        const response = await axiosInstance.post('/SubmitDeliverable', {
            taskId: rawId,
            lienLivrable: deliverableLink || null,
            requesterId: getRequesterId()
        });
        return response.data.message === 'success';
    },

    updateTask: async (taskId, updatedData) => {
        const rawId = toRawId(taskId);
        
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
        if (updatedData.parentId !== undefined) {
            payload.idParent = (updatedData.parentId === null || updatedData.parentId === 'null')
                ? null
                : parseInt(updatedData.parentId, 10);
        }
        const response = await axiosInstance.post('/UpdateTask', payload);
        return response.data.message === 'success';
    },

    moveTask: async (taskId, newSprintId) => {
        const rawTaskId = toRawId(taskId);
        const targetSprint = (newSprintId === null || newSprintId === 'null' || newSprintId === 'backlog') ? null : parseInt(newSprintId, 10);
        const response = await axiosInstance.post('/AssignTaskToSprint', { taskId: rawTaskId, sprintId: targetSprint, requesterId: getRequesterId() });
        return response.data.message === 'success';
    },

    validateTask: async (taskId) => {
        const rawId = toRawId(taskId);
        const response = await axiosInstance.post('/ValidateTask', { taskId: rawId, requesterId: getRequesterId() });
        return response.data;
    },

    rejectTask: async (taskId, reason) => {
        const rawId = toRawId(taskId);
        const response = await axiosInstance.post('/RejectTask', { taskId: rawId, reason: reason, requesterId: getRequesterId() });
        return response.data;
    },

    updateTaskTag: async (taskId, newTag, tagIndex = 0) => {
        console.warn("[API] Tags are updated via full updateTask now.");
        return Promise.resolve(true);
    },

    deleteTask: async (taskId) => {
        try {
            const rawId = toRawId(taskId);
            const response = await axiosInstance.post('/DeleteTask', { taskId: rawId, requesterId: getRequesterId() });
            return response.data.message === 'success';
        } catch (error) {
            console.error("Error deleting task:", error);
            return false;
        }
    },

    batchMoveTasks: async (taskIds, sprintId) => {
        try {
            const rawIds = taskIds.map(id => toRawId(id));
            const targetSprint = (sprintId === null || sprintId === 'null' || sprintId === 'backlog') ? null : parseInt(sprintId, 10);
            const response = await axiosInstance.post('/BatchMoveTasksToSprint', { taskIds: rawIds, sprintId: targetSprint, requesterId: getRequesterId() });
            return response.data;
        } catch (error) {
            console.error("Error batch moving tasks:", error);
            return null;
        }
    },

    reorderTasks: async (taskIds, sprintId) => {
        try {
            const rawIds = taskIds.map(id => toRawId(id));
            const targetSprint = (sprintId === null || sprintId === 'null' || sprintId === 'backlog') ? null : parseInt(sprintId, 10);
            const response = await axiosInstance.post('/ReorderTasks', { taskIds: rawIds, sprintId: targetSprint, requesterId: getRequesterId() });
            return response.data;
        } catch (error) {
            console.error("Error reordering tasks:", error);
            return null;
        }
    }
};