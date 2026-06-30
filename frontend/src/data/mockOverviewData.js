export const projectInfo = {
  name: "Mini-Jira",
  key: "#SPDV2",
  description: "Un outil de gestion de projet minimaliste pour le suivi des tâches et des sprints.",
  status: "Actif",
  startDate: "2026-05-01",
  endDate: "2026-12-31",
};

export const members = [
  { id: 1, name: "Yasser", role: "Admin", initials: "Y", bgColor: "#185fa5", textColor: "#FFF" },
  { id: 2, name: "Khalid", role: "Membre", initials: "K", bgColor: "#ef9f27", textColor: "#FFF" },
  { id: 3, name: "Sara", role: "Observateur", initials: "S", bgColor: "#10b981", textColor: "#FFF" },
];

export const metrics = {
  totalIssues: 42,
  completed: 28,
  inProgress: 10,
  overdue: 2,
};

export const activeSprintSummary = {
  sprintName: "Sprint 2 - Core Engine & Backlog",
  startDate: "26 mai",
  endDate: "09 juin 2026",
  daysRemaining: 5,
  distribution: {
    todo: 3,
    inProgress: 5,
    review: 2,
    done: 4,
  },
  totalCompleted: 4,
  totalIssues: 14,
};

export const taskBreakdown = {
  byType: [
    { type: "Feature", count: 18, color: "#10b981" },
    { type: "Task", count: 14, color: "#3b82f6" },
    { type: "Bug", count: 7, color: "#ef4444" },
    { type: "Story", count: 3, color: "#f59e0b" },
  ],
  byPriority: [
    { priority: "Critique", count: 2, color: "#dc2626" },
    { priority: "Haute", count: 12, color: "#ea580c" },
    { priority: "Moyenne", count: 20, color: "#f59e0b" },
    { priority: "Basse", count: 8, color: "#3b82f6" },
  ],
};

export const recentActivity = [
  { id: 1, name: "Yasser", initials: "Y", bgColor: "#185fa5", action: "a terminé la tâche", issueName: "Intégration du CSS unifié", time: "Il y a 2 heures" },
  { id: 2, name: "Khalid", initials: "K", bgColor: "#ef9f27", action: "a déplacé", issueName: "Créer les composants UI", time: "Il y a 4 heures", targetState: "En cours" },
  { id: 3, name: "Sara", initials: "S", bgColor: "#10b981", action: "a commenté sur", issueName: "Correction des décalages", time: "Hier à 14:30" },
  { id: 4, name: "Yasser", initials: "Y", bgColor: "#185fa5", action: "a créé le bug", issueName: "Problème de connexion avec OAuth", time: "Hier à 10:15" },
  { id: 5, name: "Khalid", initials: "K", bgColor: "#ef9f27", action: "a archivé le sprint", issueName: "Sprint 1", time: "Il y a 2 jours" },
  { id: 6, name: "Système", initials: "⚙️", bgColor: "#64748b", action: "a démarré", issueName: "Sprint 2 - Core Engine", time: "Il y a 2 jours" },
];
