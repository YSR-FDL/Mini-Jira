import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Users, FolderOpen } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import TeamHeader from '../../components/teams/TeamHeader'
import TeamMemberCard from '../../components/teams/TeamMemberCard'
import { teamsData, teamMembersData, teamProjectsData } from '../../data/mockData'
import s from '../../styles/teams/TeamDetailsPage.module.css'
import ProjectCard from '../../components/page projets/ProjectCard'
import axios from 'axios'
import EditTeamModal from '../../components/teams/EditTeamModal'
import AddMemberModal from "../../components/teams/AddMemberModal";
import MemberProfileModal from '../../components/teams/MemberProfileModal'

export default function TeamDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.type_utilisateur === 'ADMIN';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Voir le profil d'un membre
  function handleViewProfile(member) {
    setSelectedMember(member);
  }

  const handleAddMembers = async (selectedMembers) => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/AddMembersToTeam",
        {
          idTeam: team.id,
          members: selectedMembers.map(member => member.id)
        }
      );

      setTeam(prev => ({
        ...prev,
        membres: [...prev.membres, ...selectedMembers]
      }));

      setMembers(prev => [
        ...prev,
        ...selectedMembers
      ]);

      setShowAddMemberModal(false);
    }
    catch(error) {
      console.error(error);
    }
  };

  const handleUpdateTeam = async (id, nom, objectif) => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/UpdateTeam",
        {
          id,
          nom,
          objectif
        }
      );
      setTeam(prev => ({...prev, nom, objectif}));
      setShowEditModal(false);
    }
    catch(error) {
      console.error(error);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await axios.post(
        "http://localhost:8080/Backend_PFA/DeleteTeam",
        {
          id: team.id
        }
      );
      navigate("/teams");
    }
    catch(error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/Backend_PFA/GetTeam?id=${id}`
        );
        setTeam(response.data);
        setMembers(response.data.membres || []);
      }
      catch(error) {
        console.error(error);
      }
    };
    fetchTeam();
  }, [id]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/Backend_PFA/GetProjectsByTeam?idTeam=${id}`
        );
        setProjects(response.data);
        console.log("wa ta fin ra hadchi khedam")
      }
      catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, [id]);


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


  const confirmRemoveMember = async () => {
    try {

      await axios.post(
        "http://localhost:8080/Backend_PFA/RemoveMemberFromTeam",
        {
          idTeam: team.id,
          idUser: memberToRemove.id
        }
      );

      setMembers(prev =>
        prev.filter(m => m.id !== memberToRemove.id)
      );

      setTeam(prev => ({
        ...prev,
        membres: prev.membres.filter(
          m => m.id !== memberToRemove.id
        )
      }));
      showToast("Membre retiré avec succès");
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);

    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de la suppression du membre");
    }
  };

  //  Voir un projet 
  function handleViewProject(project) {
    navigate('/projects')
  }

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberConfirm(true);
  };

  const openAddMemberModal  = () => {
    setShowAddMemberModal(true);
  };

  const handleDelete = () => {
      setShowDeleteConfirm(true);
  };

  return (
    <>
    <Layout activeNav="équipes" pageTitle="Détails équipe">
      <main className={s.page}>

        {/* ── Fil d'Ariane ── */}
        <div className={s.breadcrumb}>
          <button className={s.backBtn} onClick={() => navigate('/teams')}>
            <ChevronLeft size={15} />
            Toutes les équipes
          </button>
          <span className={s.breadcrumbSep}>/</span>
          <span className={s.breadcrumbCurrent}>{team.nom}</span>
        </div>

        {/* ── Header de l'équipe ── */}
        <TeamHeader team={team} onEdit={handleEdit} onAddMember={openAddMemberModal} onDelete={handleDelete} isAdmin={isAdmin}/>

        {/* ── Section Membres ── */}
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div className={s.sectionTitle}>
              <Users size={16} color="var(--blue)" />
              <h2>Membres de l'équipe</h2>
              <span className={s.countBadge}>{team.membres.length}</span>
            </div>
          </div>

          {team.membres.length > 0 ? (
            <div className={s.membersGrid}>
              {members.map((member, index) => (
                <div key={member.id} style={{ animationDelay: `${index * 0.06}s` }}>
                  <TeamMemberCard
                    member={member}
                    onViewProfile={handleViewProfile}
                    onRemove={handleRemoveMember}
                    isAdmin={isAdmin}
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
                <div key={project.idProject}>
                  <ProjectCard project={project} />
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
      {showDeleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.deleteModal}>
            <h3>Confirmer la suppression</h3>

            <p>
              Cette action est irréversible. Voulez-vous vraiment supprimer
              l'équipe "{team.nom}" ?
            </p>

            <div className={s.modalActions}>
              <button className={s.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>

              <button className={s.deleteBtn} onClick={() => {setShowDeleteConfirm(false);handleDeleteTeam();}}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {showRemoveMemberConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.deleteModal}>
            <h3>Confirmer le retrait</h3>

            <p>
              Voulez-vous vraiment retirer
              {" "}
              "{memberToRemove?.prenom} {memberToRemove?.nom}"
              {" "}
              de cette équipe ?
            </p>

            <div className={s.modalActions}>
              <button
                className={s.cancelBtn}
                onClick={() => {
                  setShowRemoveMemberConfirm(false);
                  setMemberToRemove(null);
                }}
              >
                Annuler
              </button>

              <button
                className={s.deleteBtn}
                onClick={confirmRemoveMember}
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddMemberModal && (
        <AddMemberModal
            team={team}
            onClose={() => setShowAddMemberModal(false)}
            onAddMembers={handleAddMembers}
        />
      )}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
      {toast && (
        <div className={`${s.toast} ${toast === "Erreur lors de la suppression du membre" ? s.toastError : ""}`}>
          {toast}
        </div>
      )}
    </Layout>
    {showEditModal && (
        <EditTeamModal
            team={team}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdateTeam}
        />
    )}
    </>
  )
}
