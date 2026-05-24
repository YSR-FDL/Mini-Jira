import { Plus } from "lucide-react"
import s from "../../styles/teams/CreateTeamButton.module.css"

export default function CreateTeamButton({ onClick }) {
  return (
    <button className={s.createbtn} onClick={onClick} title="Créer">
      <Plus size={22} />
    </button>
  )
}
