import axios from 'axios';

const API = 'http://localhost:8080/Backend_PFA';

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

// Mappe une tâche backend vers la forme utilisée par le frontend.
const mapTask = (t) => {
    const key = getProjectKey();
    return {
        id: `${key}-${t.idTask}`,
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
        deliverableLink: t.lienLivrable !== undefined ? t.lienLivrable : null,
    };
};

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
        const raw = toRawId(parentId);
        return axios.get(`${API}/GetTaskChildren?parentId=${raw}`)
            .then(r => (r.data || []).map(mapTask));
    },
};
