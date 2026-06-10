import s from '../../styles/teams/MemberProfileModal.module.css'

const rolesLabels = {
    scrum: "Scrum Master",
    po: "Product Owner",
    dev: "Développeur",
    designer: "Designer",
    tester: "Testeur"
}

export default function MemberProfileModal({ member, onClose }) {
    if (!member) return null

    const initials = `${member.prenom?.[0] ?? ''}${member.nom?.[0] ?? ''}`.toUpperCase()

    return (
        <div className={s.modalOverlay} onClick={onClose}>
        <div className={s.modal} onClick={e => e.stopPropagation()}>

            <div className={s.viewHeader}>
            <div className={s.viewAvatar} style={{ background: 'var(--blue)' }}>
                {initials}
            </div>
            <div className={s.viewIdentity}>
                <span className={s.viewName}>{member.prenom} {member.nom}</span>
                {member.login && <span className={s.viewEmail}>{member.login}</span>}
                {member.email && <span className={s.viewEmail}>{member.email}</span>}
                <span className={s.viewTypeBadge}>{member.role || 'Membre'}</span>
            </div>
            </div>

            {/* ── Expériences ── */}
            <div className={s.viewSection}>
            <p className={s.viewSectionLabel}>Expériences</p>
            <div className={s.viewChips}>
                {member.experiences?.length > 0 ? member.experiences.map((exp, i) => (
                    <span key={i} className={s.viewChip}>
                        {rolesLabels[exp] || exp}
                    </span>
                    ))
                : <span className={s.viewEmpty}>Aucune expérience renseignée.</span>
                }
            </div>
            </div>

            {/* ── Stats ── */}
            <div className={s.viewStats}>
            <div className={s.viewStatCard}>
                <div className={s.viewStatValue}>{member.nbProjets ?? 0}</div>
                <div className={s.viewStatLabel}>projets</div>
            </div>
            <div className={s.viewStatCard}>
                <div className={s.viewStatValue}>{member.nbEquipes ?? 0}</div>
                <div className={s.viewStatLabel}>équipes</div>
            </div>
            </div>

            {/* ── Actions ── */}
            <div className={s.modalActions}>
            <button className={s.btnCancel} onClick={onClose}>Fermer</button>
            </div>

        </div>
        </div>
    )
}