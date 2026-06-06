import { useEffect, useState } from "react";
import s from "../../styles/teams/AddMemberModal.module.css";
import axios from "axios";

export default function AddMemberModal({team, onClose, onAddMembers }) {
    const [search, setSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
    const fetchUsers = async () => {
        try {
        const response = await axios.get(
            "http://localhost:8080/GetAllUsers"
        );

        setUsers(response.data);
        }
        catch(error) {
        console.error(error);
        }
    };

    fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        user => !team.membres.some(member => member.id === user.id) && (`${user.prenom} ${user.nom}`).toLowerCase().includes(search.toLowerCase())
    );

    const addMember = (user) => {
        setSelectedMembers(prev => [...prev, user]);
    };

    const removeMember = (id) => {
        setSelectedMembers(prev =>
        prev.filter(member => member.id !== id)
        );
    };

    const handleSubmit = () => {
        onAddMembers(selectedMembers);
        onClose();
    };

    return (
        <div className={s.modalOverlay}>
        <div className={s.modal}>

            <div className={s.header}>
            <h2>Ajouter des membres</h2>
            <button className={s.closeBtn} onClick={onClose}>X</button>
            </div>

            <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={s.input}
            />

            <div className={s.userList}>
            {filteredUsers.map(user => (
                <div key={user.id} className={s.userItem}>
                <span>{user.nom} {user.prenom}</span>

                <button className={s.addBtn} onClick={() => addMember(user)}>Ajouter</button>
                </div>
            ))}
            </div>

            <div className={s.selectedSection}>
            <h4>Membres sélectionnés</h4>

            {selectedMembers.map(member => (
                <div
                key={member.id}
                className={s.selectedItem}
                >
                <span>{member.nom}</span>

                <button
                    className={s.removeBtn}
                    onClick={() => removeMember(member.id)}
                >
                    Retirer
                </button>
                </div>
            ))}
            </div>

            <div className={s.actions}>
            <button
                className={s.cancelBtn}
                onClick={onClose}
            >
                Annuler
            </button>

            <button
                className={s.confirmBtn}
                onClick={handleSubmit}
            >
                Ajouter
            </button>
            </div>

        </div>
        </div>
    );
}