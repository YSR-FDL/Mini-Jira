import React, { useState } from 'react'
import styles from '../../styles/Project/ProjectCard.module.css'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  'ARCHIVÉ':      { bg: '#EAF2FF', color: '#0052CC', border: '#B3D4FF' },
  'EN COURS': { bg: '#FFF3E0', color: '#B25000', border: '#FFD8A8' },
  TERMINÉ:   { bg: '#E3FCEF', color: '#006644', border: '#ABF5D1' },
}

export default function ProjectCard({ project }) {
  const statusStyle = statusColors[project.status] || statusColors['ACTIVE']
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate();

  const progressColor = project.progress >= 100 ? 'var(--green)' : project.progress >= 50  ? 'var(--blue)' :
    project.progress >= 25  ? '#F79009' : 'var(--red)'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{project.title}</h3>
        <div className={styles.menuWrapper}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
          {menuOpen && (
            <div className={styles.dropdown}>
              {!project.archived ? (
              <>
                <button onClick={() => setMenuOpen(false)}>Modifier</button>
                <button onClick={() => setMenuOpen(false)}>Archiver</button>
              </>) : null}
              <button className={styles.danger} onClick={() => setMenuOpen(false)}> Supprimer</button>
            </div>
          )}
        </div>
      </div>
      <p className={styles.desc}>{project.description}</p>
      <span className={styles.badge} style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
        {project.status}
      </span>
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${project.progress}%`, background: progressColor }}/>
        </div>
      </div>
      <div className={styles.meta}>
        <span className={styles.members}>{project.members} Member{project.members !== 1 ? 's' : ''}</span>
        <span className={styles.tasks}>✓ {project.tasksCompleted}/{project.tasksTotal} tâches</span>
      </div>
      <div className={styles.footer}>
        <span className={styles.due}>Date limite : {project.dueDate}</span>
        {project.archived ? (
          <button className={`${styles.openBtn} ${styles.projectCardBtnArchived}`} disabled> Archivé</button>
        ) : (
          <button className={styles.openBtn} onClick={() => {navigate("/backlog")}}>Consulter le projet</button>
        )}
      </div>
    </div>
  )
}
