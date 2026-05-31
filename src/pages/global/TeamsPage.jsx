import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import Layout from "../../components/layout/Layout"
import TeamCard from "../../components/teams/TeamCard"
import CreateTeamModal from "../../components/teams/CreateTeamModal"
import CreateTeamButton from "../../components/teams/CreateTeamButton"
import s from "../../styles/teams/TeamsPage.module.css"
import axios from "axios"

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 2800);
  };
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/Backend_PFA/GetUserTeams",
          {
            id: user.id,
            type_utilisateur: user.type_utilisateur
          }
        );
        console.log(response.data);
        setTeams(response.data);
      }
      catch(error) {
        console.error(error);
      }
    };
    fetchTeams();
  }, []);

  const handleCreate = async ({ name, description, members }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/Backend_PFA/CreateTeam",
        {
          nom: name,
          objectif: description,
          membres: members,
          idCreateur: user.id
        }
      );
      console.log(response.data);
      setTeams(prev => [...prev, response.data]);
      showToast("Équipe créée avec succès");
    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de la création de l'équipe");
    }
  }

  const handleUpdateTeam = async (id, nom, objectif) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/Backend_PFA/UpdateTeam",
        {
          id,
          nom,
          objectif
        }
      );

      setTeams(prev => prev.map(team => team.id === id? {...team, nom, objectif } : team));
      showToast("Équipe modifiée avec succès");
    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de la modification de l'équipe!");
    }
  };

  const handleArchiveTeam = async (idTeam) => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/ArchiveTeam",
        {
          id: idTeam
        }
      );
      setTeams(prev => prev.map(team => team.id === idTeam ? { ...team, isArchived : true } : team));
      showToast("Équipe archivée avec succès");
    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de l'archivage");
    }
  };

  const handleDeleteTeam = async (idTeam) => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/DeleteTeam",
        { id: idTeam }
      );
      setTeams(prev => prev.filter(team => team.id !== idTeam));
      showToast("Équipe supprimée avec succès");
    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de la suppression");
    }
  };

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
              <TeamCard key={team.id} team={team} onDelete={handleDeleteTeam} onUpdate={handleUpdateTeam} 
                onArchive={handleArchiveTeam} style={{ animationDelay: `${i * 0.06}s` }}/>
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
      {toast && (
          <div className={`${s.toast} ${toast === "Erreur lors de la création de l'équipe" || toast === "Erreur lors de la suppression" 
              || toast === "Erreur lors de la modification de l'équipe!" || toast === "Erreur lors de l'archivage" ? s.toastError : ""}`}>
            {toast}
          </div>
        )}
    </Layout>
  )
}