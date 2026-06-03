import { useState } from "react";
import styles from "../../styles/Project/CreateProjectModal.module.css";
import axios from "axios";
import { Trash2 } from "lucide-react";

function CreateProjectModal({ isOpen, onClose }) {
    const [nomProjet, setNomProjet] = useState("");
    const [cle, setCle] = useState("");

    const [etats, setEtats] = useState([
        "À faire",
        "En cours",
        "Revue en cours",
        "Terminé",
    ]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const projet = {nomProjet, cle, etats};

        try {
        await axios.post(
            "http://localhost:8080/api/projets",
            projet
        );

        alert("Projet créé avec succès");

        setNomProjet("");
        setCle("");
        setEtats([
            "À faire",
            "En cours",
            "Revue en cours",
            "Terminé",
        ]);

        onClose();
        } catch (error) {
        console.error(error);
        alert("Erreur lors de la création du projet");
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Créer un projet</h2>

                <form onSubmit={handleSubmit}>
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

export default CreateProjectModal;