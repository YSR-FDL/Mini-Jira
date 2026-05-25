import styles from "../../styles/Tasks/TasksPage.module.css";
import { useState } from "react";
import { CheckSquare } from "lucide-react";
import TaskCard from "./TaskCard";

const PROJECT_STATUS_CONFIG = {
    "EN COURS": { bg: "#FFF3E0", color: "#B25000", border: "#FFD8A8" },
    "TERMINÉ":  { bg: "#E3FCEF", color: "#006644", border: "#ABF5D1" },
};

function getProgressColor(progress) {
    if (progress >= 100) return "var(--green)";
    if (progress >= 50)  return "var(--blue)";
    if (progress >= 25)  return "#F79009";
    return "var(--red)";
}

export default function ProjectSection({ project, index }) {
    const [open, setOpen] = useState(true);
    const projectStatus = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG["EN COURS"];
    const progressColor = getProgressColor(project.progress);

    return (
        <div className={styles.projectSection} style={{ animationDelay: `${index * 0.1}s` }}>

        <div className={styles.projectHeader} onClick={() => setOpen((v) => !v)}>
            <div className={styles.projectHeaderLeft}>
            <div className={styles.projectIcon}><CheckSquare size={16} /></div>
            <div>
                <div className={styles.projectTitleRow}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <span className={styles.badge} style={{background: projectStatus.bg,color: projectStatus.color,border: `1px solid ${projectStatus.border}`}}>
                    {project.status}
                </span>
                </div>
                <p className={styles.projectDesc}>{project.description}</p>
            </div>
            </div>

            <div className={styles.projectHeaderRight}>
            <div className={styles.projectProgressWrap}>
                <div className={styles.projectProgressTrack}>
                <div className={styles.projectProgressFill} style={{ width: `${project.progress}%`, background: progressColor }}/>
                </div>
                <span className={styles.projectProgressPct}>{project.progress}%</span>
            </div>

            <span className={styles.taskCount}>
                {project.tasks.length} tâche{project.tasks.length > 1 ? "s" : ""}
            </span>
            <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>
            </div>
        </div>
        {open && (
            <div className={styles.taskList}>
            {project.tasks.map((task, i) => (
                <TaskCard key={task.id} task={task} index={i} />
            ))}
            </div>
        )}
        </div>
    );
}
