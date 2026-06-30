import { useState } from "react";
import s from "../../styles/teams/CreateTeamModal.module.css";

export default function EditTeamModal({ team, onClose, onUpdate }) {
    const [name, setName] = useState(team.nom);
    const [description, setDescription] = useState(team.objectif || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onUpdate( team.id, name.trim(), description.trim());
        onClose();
    };

    return (
        <div className={s.modalOverlay}>
            <div className={s.modal}>

                <div className={s.modalHeader}>
                <h2 className={s.modalTitle}>Modifier l'équipe</h2>
                <button type="button" className={s.modalClose} onClick={onClose}>✕</button>
                </div>

                <form
                className={s.modalForm}
                onSubmit={handleSubmit}
                >
                <div className={s.modalField}>
                    <label className={s.modalLabel}>
                    Nom de l'équipe
                    </label>

                    <input
                    className={s.modalInput}
                    type="text"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    />
                </div>

                <div className={s.modalField}>
                    <label className={s.modalLabel}>Objectif</label>
                    <textarea className={s.modalTextarea} value={description} onChange={(e) => setDescription(e.target.value)} rows={4}/>
                </div>

                <div className={s.modalActions}>
                    <button type="button" className={`${s.modalBtn} ${s.modalBtnCancel}`} onClick={onClose}>Annuler</button>
                    <button type="submit" className={`${s.modalBtn} ${s.modalBtnSubmit}`}> Enregistrer
                    </button>
                </div>
                </form>

            </div>
        </div>
    );
}