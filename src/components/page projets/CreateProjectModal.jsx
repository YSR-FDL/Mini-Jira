import { useState, useEffect } from "react";
import styles from "../../styles/Project/CreateProjectModal.module.css";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function CreateProjectModal({ isOpen, onClose, onCreate}) {
    const [nomProjet, setNomProjet] = useState("");
    const [cle, setCle] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));

    const [etats, setEtats] = useState([
        "A faire",
        "En cours",
        "En Revue",
        "Termine",
    ]);

    const [selectedSMId, setSelectedSMId] = useState("");
    const [selectedPOId, setSelectedPOId] = useState("");
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            setSelectedSMId("");
            setSelectedPOId("");

            axios.get("http://localhost:8080/Backend_PFA/GetAllUsers")
                .then(res => {
                    setAllUsers(res.data || []);
                })
                .catch(err => console.error("Error fetching all users:", err));
        }
    }, [isOpen]);

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
        if (!selectedSMId || !selectedPOId) {
            alert("Veuillez sélectionner un Scrum Master et un Product Owner.");
            return;
        }
        onCreate({
            nomProjet, 
            cle, 
            etats, 
            idCreateur: user.id,
            idTeam: 0,
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
                        <label className={styles.label}>Product Owner (PO) *</label>
                        <select 
                            className={styles.input} 
                            value={selectedPOId} 
                            onChange={(e) => setSelectedPOId(e.target.value)}
                            required
                        >
                            <option value="">Sélectionner un Product Owner</option>
                            {allUsers.map(m => (
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
                            required
                        >
                            <option value="">Sélectionner un Scrum Master</option>
                            {allUsers.map(m => (
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
