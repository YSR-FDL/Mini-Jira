import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { myProjectsWithTasks } from "../../data/tasksMockData";
import styles from "../../styles/Tasks/TasksPage.module.css";
import {User} from "lucide-react";
import TaskCard from "../../components/tasks/TaskCard";
import ProjectSection from "../../components/tasks/ProjectSection";

export default function TasksPage() {
  const [filter, setFilter] = useState("Toutes");
  const totalTasks = myProjectsWithTasks.reduce( (acc, p) => acc + p.tasks.length,0);
  const doneTasks = myProjectsWithTasks.reduce( (acc, p) => acc + p.tasks.filter((t) => t.status === "TERMINÉ").length,0);

  const filteredProjects = myProjectsWithTasks
    .map((project) => {
      if (filter === "Toutes") return project;
      const filteredTasks = project.tasks.filter((t) => t.status === filter);
      return { ...project, tasks: filteredTasks };
    })
    .filter((project) => project.tasks.length > 0);

  return (
    <Layout activeNav="tâches" pageTitle="Mes Tâches">
      <div className={styles.page}>

        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <h1 className={styles.pageTitle}>Mes Tâches</h1>
            <p className={styles.pageSubtitle}> Toutes vos tâches assignées, regroupées par projet. </p>
          </div>

          <div className={styles.userSummary}>
            <div className={styles.taskCounter}>
              <span className={styles.taskCounterValue}>{totalTasks}</span>
              <span className={styles.taskCounterLabel}>tâches</span>
            </div>
            <div className={styles.taskCounterDivider} />
            <div className={styles.taskCounter}>
              <span className={styles.taskCounterValue} style={{ color: "var(--green)" }}>
                {doneTasks}
              </span>
              <span className={styles.taskCounterLabel}>terminées</span>
            </div>
          </div>
        </div>

        <div className={styles.filterBar}>
          {["Toutes", "EN COURS", "À FAIRE", "TERMINÉ"].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`} onClick={() => setFilter(f)}>
              {f === "Toutes" ? "Toutes les tâches" : f === "EN COURS" ? "En cours" : f === "À FAIRE" ? "À faire" : "Terminées"}
            </button>
          ))}
        </div>

        <div className={styles.projectList}>
          {filteredProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <User size={40} strokeWidth={1.4} />
              <p>Aucune tâche trouvée pour ce filtre.</p>
            </div>
          ) : (
            filteredProjects.map((project, i) => (
              <ProjectSection key={project.id} project={project} index={i} />
            ))
          )}
        </div>

      </div>
    </Layout>
  );
}
