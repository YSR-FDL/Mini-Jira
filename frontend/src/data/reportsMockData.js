// ─── Mock data : Bug Reports ───────────────────────────────────────────────
// Structure calquée sur tasksMockData.js
// Gravité : CRITIQUE > ELEVEE > MOYENNE > FAIBLE

const GRAVITY_ORDER = { CRITIQUE: 0, ELEVEE: 1, MOYENNE: 2, FAIBLE: 3 };

export const currentUser = {
  id: 1,
  name: "Karim Lahlou",
  initials: "KL",
  role: "Développeur Frontend",
};

export const myProjectsWithReports = [
  {
    id: 1,
    title: "MiniJira Platform",
    description:
      "Plateforme de gestion de projet agile complète avec Kanban, Backlog et Sprints.",
    status: "ACTIVE",
    progress: 75,
    reports: [
      {
        id: 101,
        title: "Erreur sidebar responsive",
        description:
          "La sidebar se casse sur mobile (< 768px), le menu chevauche le contenu principal.",
        gravite: "CRITIQUE",
        status: "OPEN",
        createdAt: "12 Mai 2025",
        deadline: "20 Mai 2025",
      },
      {
        id: 102,
        title: "Bouton 'Créer sprint' non fonctionnel",
        description:
          "Le clic sur le bouton de création de sprint ne déclenche aucun modal.",
        gravite: "ELEVEE",
        status: "IN_PROGRESS",
        createdAt: "14 Mai 2025",
        deadline: "22 Mai 2025",
      },
      {
        id: 103,
        title: "Bug animation card au hover",
        description:
          "Les cartes Kanban tremblent légèrement lors du survol sur Safari.",
        gravite: "MOYENNE",
        status: "IN_PROGRESS",
        createdAt: "15 Mai 2025",
        deadline: "28 Mai 2025",
      },
      {
        id: 104,
        title: "Libellé de statut tronqué",
        description:
          "Les badges de statut affichent '...' quand le libellé dépasse 12 caractères.",
        gravite: "FAIBLE",
        status: "OPEN",
        createdAt: "16 Mai 2025",
        deadline: "30 Mai 2025",
      },
    ],
  },
  {
    id: 2,
    title: "Agile Sprint Manager",
    description:
      "Optimisation de la vélocité d'équipe grâce aux burn-down charts automatisés.",
    status: "ACTIVE",
    progress: 40,
    reports: [
      {
        id: 201,
        title: "Crash lors de la génération du burn-down chart",
        description:
          "L'application plante (white screen) quand le sprint ne contient aucune tâche.",
        gravite: "CRITIQUE",
        status: "OPEN",
        createdAt: "10 Mai 2025",
        deadline: "18 Mai 2025",
      },
      {
        id: 202,
        title: "Données de vélocité incorrectes",
        description:
          "Le calcul de vélocité ne prend pas en compte les tâches reportées au sprint suivant.",
        gravite: "ELEVEE",
        status: "OPEN",
        createdAt: "13 Mai 2025",
        deadline: "23 Mai 2025",
      },
      {
        id: 203,
        title: "Export PDF — mise en page cassée",
        description:
          "Le tableau de bord exporté en PDF perd la mise en forme des graphiques.",
        gravite: "MOYENNE",
        status: "RESOLVED",
        createdAt: "09 Mai 2025",
        deadline: "19 Mai 2025",
      },
    ],
  },
  {
    id: 3,
    title: "ENSIAS Collaboration Tool",
    description:
      "Hub de collaboration académique pour les projets de fin d'études.",
    status: "MAINTENANCE",
    progress: 100,
    reports: [
      {
        id: 301,
        title: "Téléchargement de fichiers > 10 Mo bloqué",
        description:
          "L'upload échoue silencieusement pour les fichiers dépassant 10 Mo sans message d'erreur.",
        gravite: "ELEVEE",
        status: "IN_PROGRESS",
        createdAt: "08 Mai 2025",
        deadline: "17 Mai 2025",
      },
      {
        id: 302,
        title: "Délai de chargement de la liste de membres",
        description:
          "La liste des membres prend plus de 4 secondes à s'afficher malgré un cache actif.",
        gravite: "FAIBLE",
        status: "OPEN",
        createdAt: "11 Mai 2025",
        deadline: "25 Mai 2025",
      },
    ],
  },
];

// ─── Utilitaire : trie les reports d'un projet par gravité ─────────────────
export function sortReportsByGravity(reports) {
  return [...reports].sort(
    (a, b) => (GRAVITY_ORDER[a.gravite] ?? 99) - (GRAVITY_ORDER[b.gravite] ?? 99)
  );
}
