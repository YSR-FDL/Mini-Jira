import React, { useState } from 'react'
import ProjectCard from '../../components/page projets/ProjectCard'
import styles from '../../styles/Project/ProjectsPage.module.css'
import Layout from "../../components/layout/Layout"
import {initialProjects} from "../../data/mockData";
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [filter, setFilter] = useState('All Projects')
  const [sort, setSort] = useState('Recent')
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '' })
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

  const handleCreateProject = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!newProject.title.trim()) newErrors.title = 'Le titre est requis'
    if (!newProject.description.trim()) newErrors.description = 'La description est requise'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const created = {
      id: Date.now(),
      title: newProject.title,
      description: newProject.description,
      status: 'ACTIVE',
      progress: 0,
      members: 1,
      tasksCompleted: 0,
      tasksTotal: 0,
      dueDate: 'TBD',
    }
    setProjects([...projects, created])
    setNewProject({ title: '', description: '' })
    setErrors({})
    setShowModal(false)
  }

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
          <div className={styles.overlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Créer un nouveau projet</h2>
              <form onSubmit={handleCreateProject} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Nom du projet</label>
                  <input
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    placeholder="Enter project title"
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  />
                  {errors.title && <span className={styles.error}>{errors.title}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    placeholder="Describe your project..."
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                  {errors.description && <span className={styles.error}>{errors.description}</span>}
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className={styles.submitBtn}>Créer un projet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
