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
        try {
            const response = await axiosInstance.post('/UpdateProject', projectData);
            return response.data;
        } catch (error) {
            console.error("Error updating project:", error);
            return null;
        }
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
    },
    archiveProject: async (projectId, isArchived) => {
        try {
            const response = await axiosInstance.post('/ArchiveProject', {
                projectId: projectId,
                isArchived: isArchived
            });
            return response.data;
        } catch (error) {
            console.error("Error archiving project:", error);
            return null;
        }
    },
    deleteProject: async (projectId) => {
        try {
            const response = await axiosInstance.post('/DeleteProject', {
                projectId: projectId
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting project:", error);
            return null;
        }
    },
    assignTeamToProject: async (projectId, idTeam) => {
        try {
            const response = await axiosInstance.post('/AssignTeamToProject', {
                projectId: projectId,
                idTeam: idTeam
            });
            return response.data;
        } catch (error) {
            console.error("Error assigning team to project:", error);
            return null;
        }
    }
};
