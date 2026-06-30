import { useState } from 'react'
import {
  Info, FolderKanban, Users, CheckSquare, Bug,
  LayoutDashboard, Settings, ChevronDown, GraduationCap,
  Zap,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import s from './AboutPage.module.css'

const FEATURES = [
  {
    icon: FolderKanban,
    label: 'Gestion des projets',
    desc: 'Créez, organisez et suivez vos projets en temps réel avec des indicateurs de progression clairs.',
    bg: '#EFF6FF', color: '#0052CC',
  },
  {
    icon: Users,
    label: 'Gestion des équipes',
    desc: 'Constituez vos équipes, attribuez des rôles et suivez la contribution de chaque membre.',
    bg: '#F5F3FF', color: '#6D28D9',
  },
  {
    icon: CheckSquare,
    label: 'Gestion des tâches',
    desc: 'Assignez, priorisez et tracez chaque tâche à travers des workflows personnalisables.',
    bg: '#ECFDF5', color: '#00875A',
  },
  {
    icon: Bug,
    label: 'Bug Reports',
    desc: 'Signalez, qualifiez et résolvez les anomalies avec un suivi par niveau de gravité.',
    bg: '#FFF5F5', color: '#C9372C',
  },
  {
    icon: LayoutDashboard,
    label: 'Tableau de bord',
    desc: "Visualisez en un coup d'œil les métriques essentielles de vos projets et équipes.",
    bg: '#FFF7ED', color: '#C2410C',
  },
  {
    icon: Settings,
    label: 'Paramètres du projet',
    desc: 'Configurez chaque projet, gérez les permissions et adaptez MiniJira à vos besoins.',
    bg: '#F0FDF4', color: '#065F46',
  },
]

const FAQ = [
  {
    q: "Qu'est-ce que MiniJira ?",
    a: "MiniJira est une plateforme de gestion de projets agile développée dans un cadre académique. Elle permet de gérer des projets, des équipes, des tâches et des bugs en s'inspirant des principes Scrum et Kanban.",
  },
  {
    q: "Qui peut créer un projet ?",
    a: "Les utilisateurs ayant le rôle Administrateur ou Product Owner peuvent créer un nouveau projet. Les membres peuvent être invités à rejoindre un projet existant par un administrateur.",
  },
  {
    q: "Comment rejoindre une équipe ?",
    a: "Un administrateur peut vous ajouter à une équipe depuis la page Équipes → Détails de l'équipe → Ajouter un membre. Vous recevrez alors accès aux projets associés à cette équipe.",
  },
  {
    q: "Comment signaler un bug ?",
    a: "Depuis la section Bug Reports dans le menu latéral, cliquez sur « Nouveau rapport », décrivez le problème, sélectionnez sa gravité (Faible, Moyen, Élevé, Critique) et soumettez votre signalement.",
  },
  {
    q: "Quelle est la différence entre un administrateur et un membre ?",
    a: "Un administrateur peut créer/supprimer des projets et des équipes, gérer les utilisateurs et modifier les paramètres globaux. Un membre accède aux projets qui lui sont assignés et peut gérer ses propres tâches.",
  },
  {
    q: "Comment archiver un projet ?",
    a: "Dans la page Projets, ouvrez le menu contextuel (⋮) de la carte du projet concerné, puis sélectionnez « Archiver ». Le projet n'apparaîtra plus dans les listes actives mais restera consultable.",
  },
  {
    q: "Puis-je modifier mon profil ?",
    a: "Oui. Rendez-vous dans la section Profil via le menu latéral ou en cliquant sur votre avatar en haut à droite. Vous pouvez y modifier votre nom, votre email et votre rôle.",
  },
]

const STATS = [
  { label: 'Projets actifs',    value: '12',  pct: 75, icon: FolderKanban, color: '#0052CC' },
  { label: 'Tâches complétées', value: '87%', pct: 87, icon: CheckSquare,  color: '#00875A' },
  { label: 'Membres actifs',    value: '24',  pct: 60, icon: Users,        color: '#6D28D9' },
  { label: 'Bugs résolus',      value: '94%', pct: 94, icon: Bug,          color: '#C9372C' },
]

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <Layout activeNav="about">
      <div className={s.page}>

        {/* Hero */}
        <section className={s.hero}>
          <div className={s.heroBadge}>
            <Info size={12} /> À propos de la plateforme
          </div>
          <h1 className={s.heroTitle}>
            À propos de <span>MiniJira</span>
          </h1>
          <p className={s.heroDesc}>
            MiniJira est une plateforme agile de gestion de projets logiciels,
            conçue pour faciliter la collaboration entre équipes de développement.
            Inspirée de Jira, elle réunit projets, équipes, tâches et suivi de bugs
            en un seul espace unifié.
          </p>
        </section>

        {/* Présentation */}
        <div className={s.container}>
          <section className={s.section}>
            <div className={s.sectionLabel}>La plateforme</div>
            <h2 className={s.sectionTitle}>Une solution agile complète</h2>
            <div className={s.presentationGrid}>

              <div className={s.presentationText}>
                <p>
                  MiniJira centralise tout ce dont une équipe a besoin pour livrer
                  des projets logiciels de qualité. Inspirée des méthodologies Agile
                  (Scrum &amp; Kanban), elle s'adapte aussi bien aux petites équipes
                  qu'aux structures plus importantes.
                </p>
                <p>
                  Chaque fonctionnalité a été pensée pour rester simple à prendre
                  en main tout en offrant un niveau de contrôle suffisant pour
                  piloter des projets réels.
                </p>
                <div className={s.pillList}>
                  {['Gestion de projets', 'Équipes', 'Tâches', 'Bug Reports', 'Agile'].map(label => (
                    <span key={label} className={s.pill}>
                      <Zap size={11} /> {label}
                    </span>
                  ))}
                </div>
              </div>


            </div>
          </section>
        </div>

        <hr className={s.divider} />

        {/* Fonctionnalités */}
        <div className={s.container}>
          <section className={s.section}>
            <div className={s.sectionLabel}>Fonctionnalités</div>
            <h2 className={s.sectionTitle}>Ce que MiniJira vous offre</h2>
            <p className={s.sectionDesc}>
              Six modules intégrés pour couvrir l'ensemble du cycle de vie d'un projet logiciel,
              du backlog jusqu'à la résolution des bugs.
            </p>
            <div className={s.featuresGrid}>
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={f.label} className={s.featureCard} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={s.featureIconWrap} style={{ background: f.bg }}>
                      <Icon size={19} color={f.color} strokeWidth={1.8} />
                    </div>
                    <div className={s.featureTitle}>{f.label}</div>
                    <div className={s.featureDesc}>{f.desc}</div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <hr className={s.divider} />

        {/* FAQ */}
        <div className={s.container}>
          <section className={s.section}>
            <div className={s.sectionLabel}>FAQ</div>
            <h2 className={s.sectionTitle}>Questions fréquentes</h2>
            <p className={s.sectionDesc}>
              Retrouvez les réponses aux questions les plus posées sur MiniJira.
            </p>
            <div className={s.faqList}>
              {FAQ.map((item, i) => (
                <div key={i} className={`${s.faqItem}${openIndex === i ? ' ' + s.open : ''}`}>
                  <button className={s.faqTrigger} onClick={() => toggle(i)}>
                    <span className={s.faqQuestion}>{item.q}</span>
                    <ChevronDown size={16} className={s.faqChevron} />
                  </button>
                  <div className={s.faqBody}>
                    <p className={s.faqAnswer}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={s.footer}>
          <p className={s.footerText}>
            MiniJira est une plateforme développée dans le cadre d'un projet académique
            afin de faciliter la gestion collaborative des projets logiciels.
            Elle n'est pas affiliée à Atlassian ou au produit Jira.
          </p>
          <span className={s.footerBadge}>
            <GraduationCap size={13} /> Projet académique — ENSIAS
          </span>
        </footer>

      </div>
    </Layout>
  )
}