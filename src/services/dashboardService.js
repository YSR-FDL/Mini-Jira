import axios from 'axios';

const API = 'http://localhost:8080';

export const dashboardService = {
    getMetrics: (projectId) =>
        axios.get(`${API}/GetDashboardMetrics?projectId=${projectId}`).then(r => r.data),
};
