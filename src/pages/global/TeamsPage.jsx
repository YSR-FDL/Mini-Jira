import { useState } from "react"
import { Plus } from "lucide-react"
import Layout from "../../components/layout/Layout"
import TeamCard from "../../components/teams/TeamCard"
import CreateTeamModal from "../../components/teams/CreateTeamModal"
import CreateTeamButton from "../../components/teams/CreateTeamButton"
import { teamsData } from "../../data/mockData"
import s from "../../styles/teams/TeamsPage.module.css"

export default function TeamsPage() {
  const [teams, setTeams] = useState(teamsData)
  const [showModal, setShowModal] = useState(false)

  const handleCreate = ({ name, description }) => {
    const newTeam = {
      id: Date.now(),
      name,
      description,
      membres: 1,
      projets: 0,
      progression: 0,
      archived: false,
    }

    setTeams((prev) => [...prev, newTeam])
  }

  return (
    <Layout activeNav="équipes" pageTitle="Équipes">
      <div className={s.pageContent}>
        <div className={s.teamsPage}>
          <div className={s.teamsPageHeader}>
            <div>
              <h1 className={s.teamsPageTitle}>Mes équipes</h1>

              <p className={s.teamsPageSubtitle}> Visualisez et accédez à toutes les équipes dont vous êtes membre.</p>
            </div>
            <button className={s.teamsPageCreateBtn} onClick={() => setShowModal(true)}>
              <Plus size={16} />Créer une équipe
            </button>
          </div>

          <div className={s.teamsGrid}>
            {teams.map((team, i) => (
              <TeamCard key={team.id} team={team} style={{ animationDelay: `${i * 0.06}s` }}/>
            ))}

            <div className={s.teamCardCreate} onClick={() => setShowModal(true)}>
              <div className={s.teamCardCreateIcon}>
                <Plus size={22} />
              </div>

              <span className={s.teamCardCreateLabel}>Créer une équipe</span>

              <span className={s.teamCardCreateSub}>Commencer une nouvelle collaboration</span>
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (
        <CreateTeamModal onClose={() => setShowModal(false)} onCreate={handleCreate}/>
      )}

      <CreateTeamButton onClick={() => setShowModal(true)} />
    </Layout>
  )
}