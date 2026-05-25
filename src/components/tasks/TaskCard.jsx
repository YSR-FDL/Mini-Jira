import { useNavigate } from "react-router-dom";
import { myProjectsWithTasks } from "../../data/tasksMockData";
import styles from "../../styles/Tasks/TasksPage.module.css";

const PRIORITY_CONFIG = {
    HIGH:   { label: "Haute",   bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
    MEDIUM: { label: "Moyenne", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    LOW:    { label: "Basse",   bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
};

const STATUS_CONFIG = {
    "TERMINÉ":   { label: "Terminé",    bg: "#E3FCEF", color: "#006644", border: "#ABF5D1" },
    "EN COURS":  { label: "En cours",   bg: "#EAF2FF", color: "#0052CC", border: "#B3D4FF" },
    "À FAIRE":   { label: "À faire",    bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

function getProgressColor(progress) {
    if (progress >= 100) return "var(--green)";
    if (progress >= 50)  return "var(--blue)";
    if (progress >= 25)  return "#F79009";
    return "var(--red)";
}

export default function TaskCard({ task, index }) {
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const status   = STATUS_CONFIG[task.status]     || STATUS_CONFIG["À FAIRE"];
    const progressColor = getProgressColor(task.progress);
    const navigate = useNavigate();

    return (
        <div className={styles.taskCard} style={{ animationDelay: `${index * 0.07}s` }}>

            <div className={styles.taskTop}>
            <h4 className={styles.taskTitle}>{task.title}</h4>
            <div className={styles.taskBadges}>
                <span className={styles.badge} style={{ background: priority.bg, color: priority.color, border: `1px solid ${priority.border}` }}>
                    {priority.label}
                </span>
                <span className={styles.badge} style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                    {status.label}
                </span>
            </div>
            </div>

            <p className={styles.taskDesc}>{task.description}</p>

            <div className={styles.progressRow}>
                <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${task.progress}%`, background: progressColor }}
                />
                </div>
                <span className={styles.progressPct}>{task.progress}%</span>
            </div>

            <div className={styles.taskFooter}>
                <div className={styles.taskMeta}>
                
                <span className={styles.deadline}>{task.deadline}</span>
                </div>
                <button className={styles.consultBtn} onClick={() => navigate("/board")}>Consulter</button>
            </div>
        </div>
    );
}