

export const taskService = {
    createTask: async (sprintId, title) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTask = {
                    id: `MJ-${Math.floor(Math.random() * 900) + 100}`,
                    title: title,
                    tags: ['Feature'],
                    priority: 'medium',
                    status: 'todo',
                    sprintId: sprintId,
                    points: 0,
                    assignee: null
                };
                resolve(newTask);
            }, 500);
        });
    },

    updateTaskTag: async (taskId, newTag, tagIndex = 0) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[API] Tag mis à jour pour la tâche ${taskId}: ${newTag}`);
                resolve(true);
            }, 300);
        });
    },

    moveTask: async (taskId, newSprintId, newIndex) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[API] Tâche ${taskId} déplacée vers sprint ${newSprintId} à l'index ${newIndex}`);
                resolve(true);
            }, 300);
        });
    },

    updateTaskStatus: async (taskId, newStatus, newIndex) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[API] Statut de la tâche ${taskId} mis à jour : ${newStatus} à l'index ${newIndex}`);
                resolve(true);
            }, 300);
        });
    }
};