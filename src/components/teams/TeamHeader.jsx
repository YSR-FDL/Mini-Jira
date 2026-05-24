import React from 'react'
import styles from '../../styles/teams/TeamHeader.module.css'

const iconEdit = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const iconAdd = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const iconTrash = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

const iconCalendar = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const iconUsers = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const iconFolder = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function TeamHeader({ team, onEdit, onAddMember, onDelete }) {
  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.teamIcon}>{team.name.charAt(0)}</div>

        <div className={styles.teamInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.teamName}>{team.name}</h1>
          </div>
          <p className={styles.domain}>{team.domain}</p>
          <p className={styles.description}>{team.description}</p>

          <div className={styles.metaList}>
            <span className={styles.metaItem}> {iconCalendar}Créée le {team.createdAt}</span>
            <span className={styles.metaSeparator}>·</span>
            <span className={styles.metaItem}>
              {iconUsers}
              {team.membres} membres
            </span>
            <span className={styles.metaSeparator}>·</span>
            <span className={styles.metaItem}>
              {iconFolder}
              {team.projets} projets
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onEdit}>
            {iconEdit}
            Modifier
          </button>
          <button className={styles.btnPrimary} onClick={onAddMember}>
            {iconAdd}
            Ajouter membre
          </button>
          <button className={styles.btnDanger} onClick={onDelete}>
            {iconTrash}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
