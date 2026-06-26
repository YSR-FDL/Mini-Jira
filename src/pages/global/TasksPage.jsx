import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import styles from "../../styles/Tasks/TasksPage.module.css";
import { Search, User } from "lucide-react";
import ProjectSection from "../../components/tasks/ProjectSection";
import axios from "axios";

export default function TasksPage() {
  const [filter, setFilter] = useState("Toutes");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const idUser = user?.id || 1;

  useEffect(() => {
    if (!idUser) return;

    const fetchUserTasks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/Backend_PFA/GetUserTasks",
          { params: { idUser } }
        );
        const map = {};
        response.data.forEach((task) => {
          const pid = task.idProject;
          if (!map[pid]) {
            map[pid] = {
              id: pid,
              title: task.nomProjet || `Projet ${pid}`,
              status: "EN COURS",
              description: "",
              progress: 0,
              tasks: [],
            };
          }
          map[pid].tasks.push({
            id: task.idTask,
            title: task.titre,
            description: task.description,
            status: task.statut?.toUpperCase(),
            priority: task.priorite?.toUpperCase(),
            progress: 0,
            deadline: task.dateCreation?.split(" ")[0] || "",
          });
        });

        Object.values(map).forEach((project) => {
          const total = project.tasks.length;
          const done = project.tasks.filter((t) => t.status === "TERMINÉ").length;
          project.progress = total > 0 ? Math.round((done / total) * 100) : 0;
          project.status = project.progress === 100 ? "TERMINÉ" : "EN COURS";
        });

        setProjects(Object.values(map));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTasks();
  }, [idUser]);

  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneTasks = projects.reduce(
    (acc, p) =>
      acc + p.tasks.filter((t) => t.status === "TERMINÉ").length,
    0
  );

  const filteredProjects = projects
    .map((project) => {
      let tasks = project.tasks;
      if (filter !== "Toutes") {
        tasks = tasks.filter((t) => t.status === filter);
      }
      if (search.trim()) {
        tasks = tasks.filter((t) =>
          t.title?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return { ...project, tasks };
    })
    .filter((project) => project.tasks.length > 0);

return (
    <Layout activeNav="tâches" pageTitle="Mes Tâches">
      <div className={styles.page}>

        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <h1 className={styles.pageTitle}>Mes Tâches</h1>
            <p className={styles.pageSubtitle}>
              Toutes vos tâches assignées, regroupées par projet.
            </p>
          </div>

          <div className={styles.pageHeaderRight}>
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
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterBar}>
            {["Toutes", "EN COURS", "À FAIRE", "TERMINÉ"].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "Toutes" ? "Toutes les tâches"
                  : f === "EN COURS" ? "En cours"
                  : f === "À FAIRE" ? "A faire"
                  : "Terminees"}
              </button>
            ))}
          </div>

          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.projectList}>
          {loading ? (
            <div className={styles.emptyState}>
              <p>Chargement...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <User size={40} strokeWidth={1.4} />
              <p>Aucune tâche trouvée.</p>
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