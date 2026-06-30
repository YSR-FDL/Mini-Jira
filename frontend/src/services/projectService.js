import axios from 'axios';
import { getRequesterId } from './authHelper';

const API_BASE_URL = 'http://localhost:8080/Backend_PFA';

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
            const response = await axiosInstance.post('/UpdateProject', { ...projectData, requesterId: getRequesterId() });
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
                etats: states,
                requesterId: getRequesterId()
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
                isArchived: isArchived,
                requesterId: getRequesterId()
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
                projectId: projectId,
                requesterId: getRequesterId()
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
                idTeam: idTeam,
                requesterId: getRequesterId()
            });
            return response.data;
        } catch (error) {
            console.error("Error assigning team to project:", error);
            return null;
        }
    }
};
