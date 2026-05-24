import { useState } from "react"
import { X, Plus } from "lucide-react"
import { usersData } from "../../data/mockData"
import s from "../../styles/teams/CreateTeamModal.module.css"

export default function CreateTeamModal({onClose,onCreate}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [memberInput, setMemberInput] = useState("")
  const [members, setMembers] = useState([])
  const [errors, setErrors] = useState({})

  const filteredUsers = usersData.filter((user) =>
    user.name.toLowerCase().includes(memberInput.toLowerCase())
  )

  const handleAddMember = (user) => {
    const alreadyExists = members.some(
      (member) => member.id === user.id
    )
    if (alreadyExists) {
      return
    }

    setMembers((prev) => [...prev, user])
    setMemberInput("")
  }

  const handleRemoveMember = (memberToRemove) => {
    setMembers((prev) =>
      prev.filter(
        (member) => member.id !== memberToRemove.id
      )
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onCreate({
      name: name.trim(),
      description: description.trim(),
      members,
    })

    onClose()
  }

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Créer une équipe</h2>
          <button className={s.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className={s.modalForm} onSubmit={handleSubmit}>
          <div className={s.modalField}>
            <label className={s.modalLabel}>Nom de l'équipe</label>
            <input className={s.modalInput + (errors.name ? ` ${s.modalInputError}` : "")}
              type="text" placeholder="Nom de l'équipe" value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({...prev, name: "",}))
              }}
            />

            {errors.name && (
              <span className={s.modalError}>{errors.name}</span>
            )}
          </div>

          <div className={s.modalField}>
            <label className={s.modalLabel}>Ajouter des membres</label>

            <input className={s.modalInput} type="text" placeholder="Rechercher un membre..." value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}/>

            {memberInput && (
              <div className={s.searchResults}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className={s.searchItem}>
                      <span>{user.name}</span>

                      <button type="button" className={s.addUserBtn} onClick={() => handleAddMember(user)}>
                        <Plus size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={s.noResults}> Aucun utilisateur trouvé</div>
                )}
              </div>
            )}

            {members.length > 0 && (
              <div className={s.membersList}>
                {members.map((member) => (
                  <div key={member.id} className={s.memberChip}>
                    <span>{member.name}</span>

                    <button type="button" onClick={() => handleRemoveMember(member)}>x</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={s.modalField}>
            <label className={s.modalLabel}> Description de l'équipe</label>

            <textarea className={ s.modalTextarea + (errors.description ? ` ${s.modalInputError}` : "")}
              placeholder="Décrivez l'objectif de cette équipe..." value={description} rows={4}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((prev) => ({...prev, description: "",}))
              }}
            />

            {errors.description && (
              <span className={s.modalError}> {errors.description}</span>)}
          </div>

          <div className={s.modalActions}>
            <button type="button" className={`${s.modalBtn} ${s.modalBtnCancel}`} onClick={onClose}>Annuler</button>
            <button type="submit" className={`${s.modalBtn} ${s.modalBtnSubmit}`}>Créer l'équipe</button>
          </div>
        </form>
      </div>
    </div>
  )
}