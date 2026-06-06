import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const projectService = {
    getProjectById: async (projectId) => {
        try {
            const response = await axiosInstance.get(`/GetProject?projectId=${projectId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching project:", error);
            return null;
        }
    },
    updateProject: async (projectData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[API] Projet mis à jour avec les données :`, projectData);
                resolve({ success: true, data: projectData });
            }, 500);
        });
    },
    updateProjectStates: async (projectId, states) => {
        try {
            const response = await axiosInstance.post('/UpdateProjectStates', {
                projectId: projectId,
                etats: states
            });
            return response.data;
        } catch (error) {
            console.error("Error updating project states:", error);
            return null;
        }
    }
};
