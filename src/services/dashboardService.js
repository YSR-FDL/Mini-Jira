import axios from 'axios';
import { getRequesterId } from './authHelper';

const API = 'http://localhost:8080/Backend_PFA';

export const dashboardService = {
    getMetrics: (projectId) =>
        axios.get(`${API}/GetDashboardMetrics?projectId=${projectId}`).then(r => r.data),
    getGlobalMetrics: () => {
        const userId = getRequesterId();
        return axios.get(`${API}/GetGlobalDashboardMetrics?userId=${userId}`).then(r => r.data);
    },
};
