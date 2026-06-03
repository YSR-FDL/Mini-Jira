import React, { useState } from 'react'
import ProjectCard from '../../components/page projets/ProjectCard'
import styles from '../../styles/Project/ProjectsPage.module.css'
import Layout from "../../components/layout/Layout"
import {initialProjects} from "../../data/mockData";
import { Plus } from 'lucide-react';
import CreateProjectModal from "../../components/page projets/CreateProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [filter, setFilter] = useState('All Projects')
  const [sort, setSort] = useState('Recent')
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({})

  const filteredProjects = projects.filter(p => {
    if (filter === 'Tout les projets') return true
    if (filter === 'En cours') return p.status === 'EN COURS'
    if (filter === 'Terminé') return p.status === 'TERMINÉ'
    if (filter === 'Archivé') return p.archived
    return true
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sort === 'Trier par : Nom') {
      return a.title.localeCompare(b.title)
    }

    if (sort === 'Trier par : Progression') {
      return b.progress - a.progress
    }

    return b.id - a.id
  })

  return (
    <Layout activeNav="projets" pageTitle="Projets">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Mes Projets</h1>
            <p className={styles.subtitle}>Consultez tous les projets auxquels vous participez.</p>
          </div>
          <div className={styles.controls}>
            <select className={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
              <option>Tout les projets</option>
              <option>En cours</option>
              <option>Terminé</option>
              <option>Archivé</option>
            </select>
            <select className={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
              <option>Trier par : Récent</option>
              <option>Trier par : Nom</option>
              <option>Trier par : Progression</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {sortedProjects.map((project, i) => (
            <div key={project.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <ProjectCard project={project} />
            </div>
          ))}
          <div className={styles.createCard}>
            <div className={styles.createIcon}> <Plus size={24} /> </div>
            <h3 className={styles.createTitle}>Créer un projet</h3>
            <p className={styles.createSub}>Commencer un nouveau projet</p>
          </div>
        </div>

        <button className={styles.fab} onClick={() => setShowModal(true)}>+</button>

        {showModal && (
          <CreateProjectModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </Layout>
  )
}
