import axios from 'axios';

const API = 'http://localhost:8080/Backend_PFA';

// Mappe une tâche backend vers la forme utilisée par le frontend.
const mapTask = (t) => ({
    id: `MJ-${t.idTask}`,
    rawId: t.idTask,
    title: t.titre,
    description: t.description,
    status: t.statut,
    priority: t.priorite,
    points: t.storyPoints,
    tags: t.typeTache ? [t.typeTache] : ['Feature'],
    assignee: t.assignee,
    sprintId: t.idSprint !== undefined ? t.idSprint : null,
    parentId: t.idParent !== undefined ? t.idParent : null,
});

const mapEpic = (e) => ({
    ...mapTask(e),
    childCount: e.childCount || 0,
    doneCount: e.doneCount || 0,
    totalPoints: e.totalPoints || 0,
    donePoints: e.donePoints || 0,
    children: Array.isArray(e.children) ? e.children.map(mapTask) : [],
});

export const epicService = {
    // Liste des epics d'un projet avec stories enfants + cumul de progression.
    getEpics: (projectId) =>
        axios.get(`${API}/GetEpics?projectId=${projectId}`)
            .then(r => (r.data || []).map(mapEpic)),

    // Tâches enfants d'un parent (epic ou story).
    getChildren: (parentId) => {
        const raw = parseInt(String(parentId).replace('MJ-', ''), 10);
        return axios.get(`${API}/GetTaskChildren?parentId=${raw}`)
            .then(r => (r.data || []).map(mapTask));
    },
};
