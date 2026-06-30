export const userProfile = {
  fullName: "Khalid Lamachi",
  role: "Développeur",
  email: "khalidlamachi2005@gmail.com",
};

export const stats = {
  taches: 128,
  projets: 12,
  collabs: 24,
  score: 94,
};

export const contributions = [
  {
    id: 1,
    iconBg: "#E8F0FE",
    iconColor: "#1a73e8",
    status: "En cours",
    statusColor: "#1a73e8",
    statusBg: "#E8F0FE",
    title: "Développement Backend",
    description: "Optimizing microservices architecture for higher throughput.",
    progress: 65,
    progressColor: "#1a73e8",
    dueDate: "15 Oct",
  },
  {
    id: 2,
    iconBg: "#FEE8E8",
    iconColor: "#e8341a",
    status: "En Revue",
    statusColor: "#6b7280",
    statusBg: "#F3F4F6",
    title: "Design System v2",
    description: "Building a consistent library for all MiniJira sub-products.",
    progress: 88,
    progressColor: "#1a73e8",
    dueDate: "30 Sep",
  },
];

export const completedContributions = [
  {
    id: 3,
    iconBg: "#E8F5E9",
    iconColor: "#2e7d32",
    status: "Termine",
    statusColor: "#2e7d32",
    statusBg: "#E8F5E9",
    title: "Auth Module",
    description: "JWT login and role-based access control implementation.",
    progress: 100,
    progressColor: "#2e7d32",
    dueDate: "20 Août",
  },
  {
    id: 4,
    iconBg: "#FFF3E0",
    iconColor: "#e65100",
    status: "Termine",
    statusColor: "#2e7d32",
    statusBg: "#E8F5E9",
    title: "Kanban Board",
    description: "Drag-and-drop task management with swim lanes.",
    progress: 100,
    progressColor: "#2e7d32",
    dueDate: "31 Juil",
  },
];

export const teamsData = [
  {
    id: 1,
    name: "Équipe Frontend",
    description: "Développement des interfaces utilisateur et de l'expérience client pour la plateforme...",
    membres: 12,
    projets: 5,
    progression: 85,
    archived: false,
    createdAt: 'Dec 05, 2024',
  },
  {
    id: 2,
    name: "Équipe Backend",
    description: "Architecture microservices, gestion des bases de données et APIs haute...",
    membres: 8,
    projets: 3,
    progression: 40,
    archived: false,
    createdAt: 'Dec 05, 2024',
  },
  {
    id: 3,
    name: "Équipe UI/UX",
    description: "Conception des systèmes de design, prototypage et tests utilisateurs.",
    membres: 4,
    projets: 4,
    progression: 95,
    archived: false,
    createdAt: 'Dec 05, 2024',
  },
  {
    id: 4,
    name: "Équipe Recherche Agile",
    description: "Veille technologique et amélioration continue des processus de gestion de projet.",
    membres: 5,
    projets: 2,
    progression: 25,
    archived: false,
    createdAt: 'Dec 05, 2024',
  },
  {
    id: 5,
    name: "Équipe Collaboration ENSIAS",
    description: "Projet académique de fin d'études réalisé en partenariat avec l'ENSIAS.",
    membres: 20,
    projets: 1,
    progression: 0,
    archived: true,
    createdAt: 'Dec 05, 2024',
  },
]

export const usersData = [
  {
    id: 1,
    name: "Khalid Lamachi",
  },
  {
    id: 2,
    name: "Salma Amrani",
  },
  {
    id: 3,
    name: "Yassine El Alaoui",
  },
  {
    id: 4,
    name: "Aya Bennani",
  },
]

export const initialProjects = [
  {
    id: 1,
    title: 'MiniJira Platform',
    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque quos dolorum debitis asperiores alias voluptas fugit similique nostrum iste cupiditate hic, molestiae officiis consectetur doloremque exercitationem, est eaque. Fuga, ipsam.',
    status: 'EN COURS',
    progress: 65,
    members: 7,
    tasksCompleted: 12,
    tasksTotal: 20,
    dueDate: 'Oct 24, 2024',
    archived: false,
  },
  {
    id: 2,
    title: 'Agile Sprint Manager',
    description: 'Optimizing team velocity and planning through automated burn-...',
    status: 'EN COURS',
    progress: 40,
    members: 5,
    tasksCompleted: 8,
    tasksTotal: 20,
    dueDate: 'Nov 15, 2024',
    archived: false,
  },
  {
    id: 3,
    title: 'ENSIAS Collaboration Tool',
    description: 'A hub for university project teamwork, connecting researchers',
    status: 'TERMINÉ',
    progress: 100,
    members: 3,
    tasksCompleted: 45,
    tasksTotal: 45,
    dueDate: 'Sep 10, 2024',
    doneDate: true,
    archived: false,
  },
  {
    id: 4,
    title: 'Smart Task Tracker',
    description: 'AI-powered task prioritization that adapts to your work habits and...',
    status: 'EN COURS',
    progress: 15,
    members: 1,
    tasksCompleted: 3,
    tasksTotal: 20,
    dueDate: 'Dec 05, 2024',
    archived: true,
  },
]


export const teamMembersData = {
  1: [
    { id: 1, name: "Khalid Lamachi",role: "Développeur",email: "khalidlamachi2005@gmail.com",initials: "KL", color: "#0052CC"},
    { id: 1, name: "Yasser Foudil",role: "Développeur",email: "YasserFoudil@gmail.com",initials: "YF", color: "#0052CC"},
  ],
  2: [
    { id: 1, name: "Khalid Lamachi",role: "Développeur",email: "khalidlamachi2005@gmail.com",initials: "KL", color: "#0052CC"},
  ],
  3: [
    { id: 1, name: "Khalid Lamachi",role: "Développeur",email: "khalidlamachi2005@gmail.com",initials: "KL", color: "#0052CC",},
  ],
  4: [
    { id: 1, name: "Khalid Lamachi",role: "Développeur",email: "khalidlamachi2005@gmail.com",initials: "KL", color: "#0052CC",},
  ],
  5: [
    { id: 1, name: "Khalid Lamachi",role: "Développeur",email: "khalidlamachi2005@gmail.com",initials: "KL", color: "#0052CC",},
  ],
};


export const teamProjectsData = {
  1: [
    {
      id: 1,
      title: 'MiniJira Platform',
      description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque quos dolorum debitis asperiores alias voluptas fugit similique nostrum iste cupiditate hic, molestiae officiis consectetur doloremque exercitationem, est eaque. Fuga, ipsam.',
      status: 'EN COURS',
      progress: 65,
      members: 7,
      tasksCompleted: 12,
      tasksTotal: 20,
      dueDate: 'Oct 24, 2024',
      archived: false,
    },
  ],
  2: [
    {
      id: 3,
      title: 'ENSIAS Collaboration Tool',
      description: 'A hub for university project teamwork, connecting researchers',
      status: 'TERMINÉ',
      progress: 100,
      members: 3,
      tasksCompleted: 45,
      tasksTotal: 45,
      dueDate: 'Sep 10, 2024',
      doneDate: true,
      archived: false,
    },
  ],
  3: [
    {
      id: 3,
      title: 'ENSIAS Collaboration Tool',
      description: 'A hub for university project teamwork, connecting researchers',
      status: 'TERMINÉ',
      progress: 100,
      members: 3,
      tasksCompleted: 45,
      tasksTotal: 45,
      dueDate: 'Sep 10, 2024',
      doneDate: true,
      archived: false,
    },
  ],
  4: [],
  5: [
    {
      id: 4,
      title: 'Smart Task Tracker',
      description: 'AI-powered task prioritization that adapts to your work habits and...',
      status: 'EN COURS',
      progress: 15,
      members: 1,
      tasksCompleted: 3,
      tasksTotal: 20,
      dueDate: 'Dec 05, 2024',
      archived: true,
    },
  ],
};
