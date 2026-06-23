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
};
