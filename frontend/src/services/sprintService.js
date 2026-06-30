import axios from 'axios';
import { getRequesterId } from './authHelper';

const API = 'http://localhost:8080/Backend_PFA';

const mapSprintToFrontend = (s) => {
    if (!s) return null;
    return {
        id: s.idSprint ? String(s.idSprint) : '',
        name: s.nomSprint || '',
        goal: s.objectif || '',
        startDate: s.dateDebut || '',
        endDate: s.dateFin || '',
        status: s.statut || 'a venir',
        capacity: (s.capacite === null || s.capacite === undefined) ? null : s.capacite,
        idProject: s.idProject
    };
};

const mapSprintToBackend = (s) => {
    if (!s) return null;
    return {
        idSprint: s.id ? parseInt(s.id) : undefined,
        nomSprint: s.name,
        objectif: s.goal,
        dateDebut: s.startDate,
        dateFin: s.endDate,
        statut: s.status || 'a venir',
        capacite: (s.capacity === null || s.capacity === undefined || s.capacity === '')
            ? null
            : parseInt(s.capacity, 10),
        idProject: s.idProject || 1,
        requesterId: getRequesterId()
    };
};

export const sprintService = {
    create: (sprint) =>
        axios.post(`${API}/CreateSprint`, mapSprintToBackend(sprint)).then(r => r.data),

    getAll: (projectId) =>
        axios.get(`${API}/GetProjectSprints?projectId=${projectId}`)
            .then(r => (r.data || []).map(mapSprintToFrontend)),

    updateStatus: (sprintId, status) =>
        axios.post(`${API}/UpdateSprintStatus`, { 
            sprintId: parseInt(sprintId), 
            status: status,
            requesterId: getRequesterId()
        }).then(r => r.data),

    update: (sprint) =>
        axios.post(`${API}/UpdateSprint`, mapSprintToBackend(sprint)).then(r => r.data),

    delete: (sprintId) =>
        axios.post(`${API}/DeleteSprint`, { 
            sprintId: parseInt(sprintId),
            requesterId: getRequesterId()
        }).then(r => r.data),
};
