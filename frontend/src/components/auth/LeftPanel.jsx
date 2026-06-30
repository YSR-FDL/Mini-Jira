import '../../styles/Auth/LeftPanel.css'

const FEATURES = [
  {
    title: 'Gestion des tâches',
    desc:  'Tableaux, backlogs, sprints — tout en une seule interface.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <rect x="7" y="7" width="3" height="9" rx="1"/>
        <rect x="14" y="7" width="3" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    title: 'Collaboration en temps réel',
    desc:  'Travaillez ensemble avec mises à jour et commentaires live.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Workflows agiles',
    desc:  'Méthodologies Scrum et Kanban intégrées nativement.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    title: 'Analytique de progression',
    desc:  'Graphiques de vélocité, burndown, cycle time tracking.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    ),
  },
]

const AVATAR_COLORS = ['#4FC3F7','#81D4FA','#B3E5FC','#E1F5FE']

export default function LeftPanel() {
  return (
    <div className="panel">
      <div className="ring ring1" />
      <div className="ring ring2" />
      <div className="orb orbA" />
      <div className="orb orbB" />
      <div className="orb orbC" />
      <div className="orb orbD" />
      <div className="blobBR" />
      <div className="blobTL" />

      <div className="content">
        {/* Logo */}
        <div className="logo">
          <div className="logoBox">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M11.53 2.21 5.41 8.34a1.64 1.64 0 0 0 0 2.32l6.12 6.12a1.64 1.64 0 0 0 2.32 0l6.12-6.12a1.64 1.64 0 0 0 0-2.32L13.85 2.21a1.64 1.64 0 0 0-2.32 0Z" fill="#fff" fillOpacity=".9"/>
              <path d="M9.2 13.5 5.41 17.3a1.64 1.64 0 0 0 0 2.32l3.12 3.12a1.64 1.64 0 0 0 2.32 0l3.79-3.79" fill="#fff" fillOpacity=".5"/>
            </svg>
          </div>
          <span className="logoText">Mini<span>Jira</span></span>
        </div>

        {/* Titre */}
        <h1 className="headline">
          Gérez vos projets<br />
          <span className="headlineAccent">à la vitesse de la lumière</span>
        </h1>
        <p className="tagline">
          L'outil de gestion de projets agile conçu pour les équipes qui avancent vite et livrent souvent.
        </p>

        {/* Features */}
        <div className="features">
          {FEATURES.map(f => (
            <div className="feature" key={f.title}>
              <div className="featureIcon">{f.icon}</div>
              <div>
                <p className="featureTitle">{f.title}</p>
                <p className="featureDesc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
