// ─── Dashboard Mock Data ────────────────────────────────────────────────────

export const dashboardStats = {
  totalProjects: 12,
  totalTasks: 148,
  completedTasks: 73,
  inProgressTasks: 45,
  totalUsers: 24,
  totalTeams: 5,
};

export const recentTasks = [
  {
    id: 1,
    title: "Implémenter le Kanban Board",
    project: "MiniJira Platform",
    priority: "HIGH",
    status: "EN COURS",
    deadline: "Oct 05, 2025",
  },
  {
    id: 2,
    title: "Page de gestion des tâches",
    project: "MiniJira Platform",
    priority: "MEDIUM",
    status: "EN COURS",
    deadline: "Oct 15, 2025",
  },
  {
    id: 3,
    title: "Dashboard des sprints actifs",
    project: "Agile Sprint Manager",
    priority: "HIGH",
    status: "EN COURS",
    deadline: "Oct 28, 2025",
  },
  {
    id: 4,
    title: "Module d'authentification JWT",
    project: "ENSIAS Collaboration Tool",
    priority: "HIGH",
    status: "TERMINÉ",
    deadline: "Aug 20, 2025",
  },
  {
    id: 5,
    title: "Génération du burn-down chart",
    project: "Agile Sprint Manager",
    priority: "MEDIUM",
    status: "À FAIRE",
    deadline: "Nov 05, 2025",
  },
  {
    id: 6,
    title: "Système de notifications",
    project: "MiniJira Platform",
    priority: "LOW",
    status: "À FAIRE",
    deadline: "Oct 24, 2025",
  },
];

export const recentActivity = [
  {
    id: 1,
    type: "project_created",
    message: "Projet \"Smart Task Tracker\" créé",
    user: "Khalid Lamachi",
    time: "il y a 2h",
    color: "var(--blue)",
  },
  {
    id: 2,
    type: "team_created",
    message: "Équipe \"Équipe DevOps\" créée",
    user: "Salma Amrani",
    time: "il y a 4h",
    color: "var(--green)",
  },
  {
    id: 3,
    type: "user_added",
    message: "Yassine El Alaoui ajouté au projet MiniJira",
    user: "Khalid Lamachi",
    time: "il y a 6h",
    color: "var(--blue-dark)",
  },
  {
    id: 4,
    type: "status_changed",
    message: "Tâche \"Auth Module\" passée à Terminé",
    user: "Aya Bennani",
    time: "Hier, 14:32",
    color: "var(--green-light)",
  },
  {
    id: 5,
    type: "sprint_created",
    message: "Sprint 3 créé dans MiniJira Platform",
    user: "Khalid Lamachi",
    time: "Hier, 09:15",
    color: "var(--blue)",
  },
  {
    id: 6,
    type: "project_created",
    message: "Projet \"API Gateway Service\" créé",
    user: "Yassine El Alaoui",
    time: "Il y a 2 jours",
    color: "var(--blue)",
  },
];

export const taskStatusData = [
  { name: "À Faire", value: 30, color: "#97A0AF" },
  { name: "En Cours", value: 45, color: "#0052CC" },
  { name: "Terminé", value: 73, color: "#00875A" },
];

export const taskPriorityData = [
  { name: "Low", value: 20, color: "#36B37E" },
  { name: "Medium", value: 42, color: "#0052CC" },
  { name: "High", value: 55, color: "#FF8B00" },
  { name: "Critical", value: 31, color: "#C9372C" },
];

export const recentProjects = [
  {
    id: 1,
    title: "MiniJira Platform",
    description: "Plateforme de gestion de projet agile complète avec Kanban, Backlog et Sprints.",
    members: 7,
    progress: 65,
    status: "EN COURS",
  },
  {
    id: 2,
    title: "Agile Sprint Manager",
    description: "Optimisation de la vélocité d'équipe grâce aux burn-down charts automatisés.",
    members: 5,
    progress: 40,
    status: "EN COURS",
  },
  {
    id: 3,
    title: "ENSIAS Collaboration Tool",
    description: "Hub de collaboration académique pour les projets de fin d'études.",
    members: 3,
    progress: 100,
    status: "TERMINÉ",
  },
  {
    id: 4,
    title: "Smart Task Tracker",
    description: "Priorisation intelligente des tâches adaptée à vos habitudes de travail.",
    members: 4,
    progress: 15,
    status: "EN COURS",
  },
];

export const myTeams = [
  { id: 1, name: "Équipe Frontend", members: 12, projects: 5, progression: 85 },
  { id: 2, name: "Équipe Backend", members: 8, projects: 3, progression: 40 },
  { id: 3, name: "Équipe UI/UX", members: 4, projects: 4, progression: 95 },
  { id: 4, name: "Équipe Recherche Agile", members: 5, projects: 2, progression: 25 },
];

export const currentSprint = {
  name: "Sprint 3 – MiniJira Platform",
  startDate: "Oct 01, 2025",
  endDate: "Oct 15, 2025",
  progress: 62,
  totalTasks: 18,
  completedTasks: 11,
  remainingTasks: 7,
  daysLeft: 4,
};

export const topContributors = [
  { id: 1, name: "Khalid Lamachi", initials: "KL", tasksCompleted: 32, color: "#0052CC" },
  { id: 2, name: "Salma Amrani", initials: "SA", tasksCompleted: 28, color: "#00875A" },
  { id: 3, name: "Yassine El Alaoui", initials: "YE", tasksCompleted: 21, color: "#FF8B00" },
  { id: 4, name: "Aya Bennani", initials: "AB", tasksCompleted: 18, color: "#C9372C" },
  { id: 5, name: "Omar Tazi", initials: "OT", tasksCompleted: 14, color: "#6554C0" },
];

export const globalSummary = {
  completionRate: 49,
  activeProjects: 8,
  activeSprints: 3,
  overdueTasks: 6,
};
