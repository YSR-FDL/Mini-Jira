import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, FolderOpen } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import TeamHeader from '../../components/teams/TeamHeader'
import TeamMemberCard from '../../components/teams/TeamMemberCard'
import { teamsData, teamMembersData, teamProjectsData } from '../../data/mockData'
import s from '../../styles/teams/TeamDetailsPage.module.css'
import ProjectCard from '../../components/page projets/ProjectCard'

export default function TeamDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Trouver l'équipe correspondant à l'id dans l'URL
  const teamId = parseInt(id, 10)
  const team = teamsData.find((t) => t.id === teamId)

  // Récupérer les membres et projets de cette équipe
  const [members, setMembers] = useState(teamMembersData[teamId] || [])
  const projects = teamProjectsData[teamId] || []

  // Si l'équipe n'existe pas, afficher un message d'erreur
  if (!team) {
    return (
      <Layout activeNav="équipes" pageTitle="Équipe introuvable">
        <div className={s.notFound}>
          <p>Cette équipe n'existe pas.</p>
          <button className={s.backBtn} onClick={() => navigate('/teams')}>
            <ChevronLeft size={16} />
            Retour aux équipes
          </button>
        </div>
      </Layout>
    )
  }

  //  Retirer un membre de l'équipe 
  function handleRemoveMember(member) {
    const ok = window.confirm(`Retirer ${member.name} de l'équipe ?`)
    if (ok) {
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    }
  }

  //  Voir le profil d'un membre 
  function handleViewProfile(member) {
    navigate('/profile')
  }

  //  Voir un projet 
  function handleViewProject(project) {
    navigate('/projects')
  }

  //  Actions du header 
  function handleEdit() {
    alert("le formulaire de modification de l'équipe")
  }

  function handleAddMember() {
    alert("le formulaire d'ajout de membre")
  }

  function handleDelete() {
    const ok = window.confirm("Supprimer cette équipe ? Cette action est irréversible.")
    if (ok) navigate('/teams')
  }

  return (
    <Layout activeNav="équipes" pageTitle="Détails équipe">
      <main className={s.page}>

        {/* ── Fil d'Ariane ── */}
        <div className={s.breadcrumb}>
          <button className={s.backBtn} onClick={() => navigate('/teams')}>
            <ChevronLeft size={15} />
            Toutes les équipes
          </button>
          <span className={s.breadcrumbSep}>/</span>
          <span className={s.breadcrumbCurrent}>{team.name}</span>
        </div>

        {/* ── Header de l'équipe ── */}
        <TeamHeader
          team={team}
          onEdit={handleEdit}
          onAddMember={handleAddMember}
          onDelete={handleDelete}
        />

        {/* ── Section Membres ── */}
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div className={s.sectionTitle}>
              <Users size={16} color="var(--blue)" />
              <h2>Membres de l'équipe</h2>
              <span className={s.countBadge}>{members.length}</span>
            </div>
          </div>

          {members.length > 0 ? (
            <div className={s.membersGrid}>
              {members.map((member, index) => (
                <div key={member.id} style={{ animationDelay: `${index * 0.06}s` }}>
                  <TeamMemberCard
                    member={member}
                    onViewProfile={handleViewProfile}
                    onRemove={handleRemoveMember}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={s.emptyState}>
              <p>Aucun membre dans cette équipe.</p>
            </div>
          )}
        </section>

        {/* ── Section Projets liés ── */}
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div className={s.sectionTitle}>
              <FolderOpen size={16} color="var(--blue)" />
              <h2>Projets liés</h2>
              <span className={s.countBadge}>{projects.length}</span>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className={s.projectsGrid}>
              {projects.map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 0.08}s` }}>
                  <ProjectCard project={project}/>
                </div>
              ))}
            </div>
          ) : (
            <div className={s.emptyState}>
              <p>Aucun projet associé à cette équipe.</p>
            </div>
          )}
        </section>

      </main>
    </Layout>
  )
}
