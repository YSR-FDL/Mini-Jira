import { useState } from "react"
import { MoreVertical } from "lucide-react"
import s from "../../styles/teams/TeamCard.module.css"
import { useNavigate } from "react-router-dom"
import EditTeamModal from "./EditTeamModal";

export default function TeamCard({ team, onDelete, onUpdate, onArchive}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const handleConsulter = () => {
    navigate(`/detailsTeam/${team.id}`)
  }
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.type_utilisateur === "ADMIN";

  return (
    <>
    <div className={ s.teamCard + (team.isArchived ? ` ${s.teamCardArchived}` : "")}>
      <div className={s.teamCardHeader}>
        <h3 className={s.teamCardName}>{team.nom}</h3>
        {isAdmin && (
          <div className={s.teamCardMenuWrap}>
            <button className={s.teamCardMenuBtn}  onClick={() => setMenuOpen((v) => !v)}>
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className={s.teamCardDropdown}>
                {!team.isArchived && (
                  <>
                    <button onClick={() => {setMenuOpen(false);setShowEditModal(true);}}>Modifier</button>
                    <button onClick={() => {setMenuOpen(false);onArchive(team.id);}}>Archiver</button>
                  </>
                )}
                <button className={s.danger} onClick={() => {setMenuOpen(false);setShowDeleteConfirm(true);}}>Supprimer</button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className={s.teamCardDesc}>{team.objectif}</p>

      <div className={s.teamCardMeta}>
        <div>
          <span className={s.teamCardMetaLabel}> Membres </span>
          <span className={s.teamCardMetaValue}> {team.membres?.length || 0} membres </span>
        </div>

        <div>
          <span className={s.teamCardMetaLabel}> Projets </span>
          <span className={s.teamCardMetaValue}> {team.projetsCount || 0} projets </span>
        </div>
      </div>

      {team.isArchived ? (
        <button className={`${s.teamCardBtn} ${s.teamCardBtnArchived}`} disabled> Archivé</button>
      ) : (
        <button className={s.teamCardBtn} onClick={handleConsulter}>Consulter l'équipe</button>
      )}
    </div>
          {showDeleteConfirm && (
        <div className={s.modalOverlay}>
          <div className={s.deleteModal}>
            <h3>Confirmer la suppression</h3>

            <p>
              Cette action est irréversible. Voulez-vous vraiment supprimer
              l'équipe "{team.nom}" ?
            </p>

            <div className={s.modalActions}>
              <button
                className={s.cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>

              <button
                className={s.deleteBtn}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(team.id);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <EditTeamModal
          team={team}
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
