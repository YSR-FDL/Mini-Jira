import axios from 'axios';
import { getRequesterId } from './authHelper';

const API = 'http://localhost:8080/Backend_PFA';

export const bugReportService = {
    /**
     * Fetches all Bug-type tasks from the logged-in user's projects,
     * grouped by project.
     * @returns {Promise<{projects: Array}>}
     */
    getBugReports: () => {
        const userId = getRequesterId();
        return axios.get(`${API}/GetBugReports?userId=${userId}`).then(r => r.data);
    },

    /**
     * Creates a new bug report (task with typeTache='Bug').
     * Any project member can call this.
     * @param {{ title: string, description: string, priority: string, projectId: number }} data
     * @returns {Promise<{message: string, idTask?: number}>}
     */
    createBugReport: (data) => {
        const payload = {
            titre: data.title,
            description: data.description || '',
            priorite: data.priority || 'medium',
            typeTache: 'Bug',
            idProject: data.projectId,
            statut: data.statut || 'todo',
            storyPoints: 0,
            requesterId: getRequesterId(),
        };
        return axios.post(`${API}/CreateTask`, payload).then(r => r.data);
    },
};
