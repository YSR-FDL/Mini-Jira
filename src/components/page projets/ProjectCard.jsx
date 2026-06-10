import React, { useState } from 'react'
import styles from '../../styles/Project/ProjectCard.module.css'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  'ARCHIVÉ':      { bg: '#EAF2FF', color: '#0052CC', border: '#B3D4FF' },
  'EN COURS': { bg: '#FFF3E0', color: '#B25000', border: '#FFD8A8' },
  TERMINÉ:   { bg: '#E3FCEF', color: '#006644', border: '#ABF5D1' },
}

export default function ProjectCard({ project }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate();
  const progress = 50;
  const progressColor = progress >= 100 ? 'var(--green)' : progress >= 50  ? 'var(--blue)' :
    progress >= 25  ? '#F79009' : 'var(--red)'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{project.nomProjet}</h3>
        <div className={styles.menuWrapper}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
          {menuOpen && (
            <div className={styles.dropdown}>
              {!project.isArchived ? (
              <>
                <button onClick={() => setMenuOpen(false)}>Modifier</button>
                <button onClick={() => setMenuOpen(false)}>Archiver</button>
              </>) : null}
              <button className={styles.danger} onClick={() => setMenuOpen(false)}> Supprimer</button>
            </div>
          )}
        </div>
      </div>
      <p className={styles.desc}>{project.cle}</p>
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${progress}%`, background: progressColor }}/>
        </div>
      </div>
      <div className={styles.meta}>
        <span className={styles.members}>  0 Member{project.members !== 1 ? 's' : ''}</span>
        <span className={styles.tasks}>✓ 0/20 tâches</span>
      </div>
      <div className={styles.footer}>
        <span className={styles.due}>Créé le : {project.dateCreation}</span>
        {project.isArchived? (
          <button className={`${styles.openBtn} ${styles.projectCardBtnArchived}`} disabled> Archivé</button>
        ) : (
          <button className={styles.openBtn} onClick={() => {
            localStorage.setItem('selectedProjectId', project.idProject);
            navigate(`/overview/${project.idProject}`);
          }}>Consulter le projet</button>
        )}
      </div>
    </div>
  )
}
