import { useState, useEffect } from "react";
import styles from "../../styles/Project/CreateProjectModal.module.css";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function CreateProjectModal({ isOpen, onClose, onCreate}) {
    const [nomProjet, setNomProjet] = useState("");
    const [cle, setCle] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));

    const [etats, setEtats] = useState([
        "À faire",
        "En cours",
        "En Revue",
        "Terminé",
    ]);

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedSMId, setSelectedSMId] = useState("");
    const [selectedPOId, setSelectedPOId] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            axios.post("http://localhost:8080/GetUserTeams", user)
                .then(res => {
                    setTeams(res.data || []);
                    setSelectedTeamId("");
                    setSelectedSMId("");
                    setSelectedPOId("");
                    setTeamMembers([]);
                })
                .catch(err => console.error("Error fetching teams:", err));
        }
    }, [isOpen]);

    const handleTeamChange = (teamId) => {
        setSelectedTeamId(teamId);
        const selectedTeam = teams.find(t => String(t.id) === String(teamId));
        if (selectedTeam && selectedTeam.membres) {
            setTeamMembers(selectedTeam.membres);
            setSelectedSMId("");
            setSelectedPOId("");
        } else {
            setTeamMembers([]);
            setSelectedSMId("");
            setSelectedPOId("");
        }
    };

    const ajouterEtat = () => {setEtats([...etats, ""]);};

    const modifierEtat = (index, valeur) => {
        const nouveauxEtats = [...etats];
        nouveauxEtats[index] = valeur;
        setEtats(nouveauxEtats);
    };

    const supprimerEtat = (index) => {
        const nouveauxEtats = etats.filter((_, i) => i !== index);
        setEtats(nouveauxEtats);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTeamId || !selectedSMId || !selectedPOId) {
            alert("Veuillez sélectionner une équipe, un Scrum Master et un Product Owner.");
            return;
        }
        onCreate({
            nomProjet, 
            cle, 
            etats, 
            idCreateur: user.id,
            idTeam: parseInt(selectedTeamId, 10),
            idSM: parseInt(selectedSMId, 10),
            idPO: parseInt(selectedPOId, 10)
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Créer un projet</h2>

                <form onSubmit={handleSubmit} style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "8px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nom du projet *</label>
                        <input className={styles.input} type="text" value={nomProjet} onChange={(e) => setNomProjet(e.target.value)} 
                            placeholder="Donner le nom du projet" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Clé du projet *</label>
                        <input className={styles.input} type="text" value={cle} onChange={(e) => setCle(e.target.value.toUpperCase())}
                                placeholder="Donner la clé du projet" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Équipe *</label>
                        <select 
                            className={styles.input} 
                            value={selectedTeamId} 
                            onChange={(e) => handleTeamChange(e.target.value)}
                            required
                        >
                            <option value="">Sélectionner une équipe</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Product Owner (PO) *</label>
                        <select 
                            className={styles.input} 
                            value={selectedPOId} 
                            onChange={(e) => setSelectedPOId(e.target.value)}
                            disabled={!selectedTeamId}
                            required
                        >
                            <option value="">Sélectionner un Product Owner</option>
                            {teamMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.login})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Scrum Master (SM) *</label>
                        <select 
                            className={styles.input} 
                            value={selectedSMId} 
                            onChange={(e) => setSelectedSMId(e.target.value)}
                            disabled={!selectedTeamId}
                            required
                        >
                            <option value="">Sélectionner un Scrum Master</option>
                            {teamMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.login})</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.statesContainer}>
                        <h3 className={styles.statesTitle}>États</h3>

                        {etats.map((etat, index) => (
                            <div key={index} className={styles.stateRow}>
                                <input className={styles.stateInput} type="text" value={etat} onChange={(e) => modifierEtat(index, e.target.value)} required />
                                <button className={styles.deleteButton} type="button" onClick={() => supprimerEtat(index)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        <button className={styles.addStateButton} type="button" onClick={ajouterEtat}>+ Ajouter un état</button>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.cancelButton} type="button" onClick={onClose}>Annuler</button>
                        <button className={styles.submitButton} type="submit">Créer le projet</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
