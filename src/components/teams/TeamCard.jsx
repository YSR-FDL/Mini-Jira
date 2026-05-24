import { useState } from "react"
import { MoreVertical } from "lucide-react"
import s from "../../styles/teams/TeamCard.module.css"
import { useNavigate } from "react-router-dom"

export default function TeamCard({ team, onView }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate();

  const handleConsulter = () => {
    navigate(`/detailsTeam/${team.id}`)
  }

  const progressColor =
    team.progression >= 80
      ? "var(--blue)"
      : team.progression >= 50
      ? "var(--blue)"
      : team.archived
      ? "var(--border-mid)"
      : "var(--blue)"

  return (
    <div className={ s.teamCard + (team.archived ? ` ${s.teamCardArchived}` : "")}>
      <div className={s.teamCardHeader}>
        <h3 className={s.teamCardName}>{team.name}</h3>

        <div className={s.teamCardMenuWrap}>
          <button className={s.teamCardMenuBtn}  onClick={() => setMenuOpen((v) => !v)}>
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className={s.teamCardDropdown}>
              {!team.archived && (
                <>
                  <button onClick={() => setMenuOpen(false)}>Modifier</button>
                  <button onClick={() => setMenuOpen(false)}>Archiver</button>
                </>
              )}
              <button className={s.danger} onClick={() => setMenuOpen(false)}>Supprimer</button>
            </div>
          )}
        </div>
      </div>

      <p className={s.teamCardDesc}>{team.description}</p>

      <div className={s.teamCardMeta}>
        <div>
          <span className={s.teamCardMetaLabel}> Membres </span>
          <span className={s.teamCardMetaValue}> {team.membres} membres </span>
        </div>

        <div>
          <span className={s.teamCardMetaLabel}> Projets </span>
          <span className={s.teamCardMetaValue}> {team.projets} projets </span>
        </div>
      </div>

      <div className={s.teamCardProgressSection}>
        <div className={s.teamCardProgressHeader}>
          <span className={s.teamCardProgressLabel}> Progression d'activité </span>
          <span className={s.teamCardProgressPct}> {team.progression}% </span>
        </div>

        <div className={s.teamCardProgressTrack}>
          <div className={s.teamCardProgressBar}
            style={{
              width: `${team.progression}%`,
              background: progressColor,
            }}
          />
        </div>
      </div>

      {team.archived ? (
        <button className={`${s.teamCardBtn} ${s.teamCardBtnArchived}`} disabled> Archivé</button>
      ) : (
        <button className={s.teamCardBtn} onClick={handleConsulter}>Consulter l'équipe</button>
      )}
    </div>
  )
}