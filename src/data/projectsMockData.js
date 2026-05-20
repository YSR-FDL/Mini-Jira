
export const initialSprints = [
    { id: 's1', name: 'Sprint 1 - Authentification & Layout', status: 'active', startDate: '11 mai', endDate: '25 mai 2026' },
    { id: 's2', name: 'Sprint 2 - Core Engine & Backlog', status: 'planned', startDate: '26 mai', endDate: '09 juin 2026' },
    { id: 'backlog', name: 'Backlog du projet', status: 'backlog' }
];

export const initialTasks = [
    {
        id: 'MJ-14',
        title: 'Configurer la base de données SQLite',
        tags: ['Tech'],
        priority: 'high',
        status: 'done',
        sprintId: 's1',
        points: 5,
        assignee: { name: 'Yasser', initials: 'YA', bgColor: '#185fa5', textColor: '#FFF' }
    },
    {
        id: 'MJ-15',
        title: 'Créer les composants UI pour le Backlog',
        tags: ['Feature'],
        priority: 'medium',
        status: 'in-progress',
        sprintId: 's1',
        points: 8,
        assignee: { name: 'Khalid', initials: 'KL', bgColor: '#ef9f27', textColor: '#FFF' }
    },
    {
        id: 'MJ-16',
        title: 'Intégration du CSS unifié de la maquette',
        tags: ['Feature'],
        priority: 'critical',
        status: 'done',
        sprintId: 's1',
        points: 3,
        assignee: { name: 'Yasser', initials: 'YA', bgColor: '#185fa5', textColor: '#FFF' }
    },
    {
        id: 'MJ-17',
        title: 'Correction des décalages de la Sidebar',
        tags: ['Bug'],
        priority: 'low',
        status: 'todo',
        sprintId: 's1',
        points: 2,
        assignee: null
    },

    {
        id: 'MJ-18',
        title: 'Développer la logique Drag and Drop pour les colonnes',
        tags: ['Feature'],
        priority: 'high',
        status: 'todo',
        sprintId: 's2',
        points: 13,
        assignee: null
    },
    {
        id: 'MJ-19',
        title: 'Optimisation des requêtes SQL d‘historique',
        tags: ['Tech'],
        priority: 'medium',
        status: 'todo',
        sprintId: 's2',
        points: 5,
        assignee: { name: 'Khalid', initials: 'KL', bgColor: '#ef9f27', textColor: '#FFF' }
    },
    {
        id: 'MJ-20',
        title: 'Bug : Écran blanc sur la route /profile sans authentification',
        tags: ['Bug'],
        priority: 'critical',
        status: 'review',
        sprintId: 's2',
        points: 8,
        assignee: null
    },

    // ticket non planifie
    { id: 'MJ-21', title: 'Mettre en place Docker pour l‘environnement de production', tags: ['Tech'], priority: 'low', status: 'todo', sprintId: 'backlog', points: 5, assignee: null },
    { id: 'MJ-22', title: 'Rédiger la documentation technique de l‘API Jakarta EE', tags: ['Tech'], priority: 'low', status: 'todo', sprintId: 'backlog', points: 3, assignee: null },
    { id: 'MJ-23', title: 'Ajouter des filtres par priorité dans la barre de recherche', tags: ['Feature'], priority: 'medium', status: 'todo', sprintId: 'backlog', points: 2, assignee: null }
];