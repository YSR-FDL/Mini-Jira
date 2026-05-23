export const projectService = {
    updateProject: async (projectData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[API] Projet mis à jour avec les données :`, projectData);
                resolve({ success: true, data: projectData });
            }, 500);
        });
    }
};
