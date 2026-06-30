import { useEffect, useState } from "react";
import s from "../../styles/teams/AddMemberModal.module.css";
import axios from "axios";

export default function AddMemberModal({ team, onClose, onAddMembers }) {
    const [search, setSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await axios.get(
            "http://localhost:8080/Backend_PFA/GetAllUsers"
            );
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        user =>
        !team.membres.some(member => member.id === user.id) &&
        !selectedMembers.some(member => member.id === user.id) === false
            ? true
            : !team.membres.some(member => member.id === user.id) &&
            `${user.prenom} ${user.nom}`
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    const addMember = (user) => {
        setSelectedMembers(prev => [...prev, user]);
    };

    const removeMember = (id) => {
        setSelectedMembers(prev => prev.filter(member => member.id !== id));
    };

    const handleSubmit = () => {
        onAddMembers(selectedMembers);
        onClose();
    };

    return (
        <div className={s.modalOverlay}>
        <div className={s.modal}>

            {/* ── Header ── */}
            <div className={s.header}>
            <h2>Ajouter des membres</h2>
            <button className={s.closeBtn} onClick={onClose}>✕</button>
            </div>

            {/* ── Recherche ── */}
            <input
            type="text"
            placeholder="Saisissez le nom du membre à ajouter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={s.input}
            />

            {/* ── Liste : visible seulement si l'utilisateur a tapé ── */}
            {search.trim() !== '' && (
            <div className={s.userList}>
                {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <div key={user.id} className={s.userItem}>
                    <div className={s.userInfo}>
                        <span className={s.userAvatar}>
                        {user.prenom?.[0]}{user.nom?.[0]}
                        </span>
                        <span className={s.userName}>{user.nom} {user.prenom}</span>
                    </div>
                    <button
                        className={s.addBtn}
                        onClick={() => addMember(user)}
                        disabled={selectedMembers.some(m => m.id === user.id)}
                    >
                        {selectedMembers.some(m => m.id === user.id) ? '✓' : 'Ajouter'}
                    </button>
                    </div>
                ))
                ) : (
                <div className={s.emptyList}>Aucun utilisateur trouvé.</div>
                )}
            </div>
            )}

            {/* ── Membres sélectionnés ── */}
            {selectedMembers.length > 0 && (
            <div className={s.selectedSection}>
                <h4>Membres sélectionnés <span className={s.countBadge}>{selectedMembers.length}</span></h4>
                {selectedMembers.map(member => (
                <div key={member.id} className={s.selectedItem}>
                    <div className={s.userInfo}>
                    <span className={s.userAvatar}>
                        {member.prenom?.[0]}{member.nom?.[0]}
                    </span>
                    <span className={s.userName}>{member.nom} {member.prenom}</span>
                    </div>
                    <button className={s.removeBtn} onClick={() => removeMember(member.id)}>
                    Retirer
                    </button>
                </div>
                ))}
            </div>
            )}

            {/* ── Actions ── */}
            <div className={s.actions}>
            <button className={s.cancelBtn} onClick={onClose}>Annuler</button>
            <button
                className={s.confirmBtn}
                onClick={handleSubmit}
                disabled={selectedMembers.length === 0}
            >
                Ajouter {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </button>
            </div>

        </div>
        </div>
    );
}