import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";

function PriorityBadge({ priority }) {
  const p = (priority || "").toLowerCase();
  const map = {
    low: { label: "Low", cls: "badge badgeLow" },
    medium: { label: "Medium", cls: "badge badgeMedium" },
    high: { label: "High", cls: "badge badgeHigh" },
    critical: { label: "Critical", cls: "badge badgeCritical" },
  };
  const { label, cls } = map[p] || { label: priority || "—", cls: "badge badgeLow" };
  return <span className={cls}>{label}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let label = status || "—";
  let cls = "badge badgeTodo";

  if (s.includes("termin") || s.includes("done") || s.includes("releas")) {
    label = "Terminé";
    cls = "badge badgeDone";
  } else if (s.includes("cours") || s.includes("progress") || s.includes("test") || s.includes("revue") || s.includes("review")) {
    label = "En Cours";
    cls = "badge badgeInProgress";
  } else {
    label = "À Faire";
    cls = "badge badgeTodo";
  }

  return <span className={cls}>{label}</span>;
}

export default function RecentTasks({ recentTasks = [] }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="cardHeader">
        <span className="cardTitle">
          <CheckSquare size={15} />
          Mes Tâches Récentes
        </span>
        <button className="cardAction" onClick={() => navigate("/tasks")}>Voir tout</button>
      </div>

      <table className="tasksTable">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Projet</th>
            <th>Priorité</th>
            <th>Statut</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          {recentTasks.map((task) => (
            <tr key={task.id}>
              <td>
                <div className="taskTitle" title={task.title}>{task.title}</div>
              </td>
              <td>
                <div className="taskProject" title={task.project}>{task.project}</div>
              </td>
              <td>
                <PriorityBadge priority={task.priority} />
              </td>
              <td>
                <StatusBadge status={task.status} />
              </td>
              <td style={{ color: "var(--text-faint)", fontSize: "12px", whiteSpace: "nowrap" }}>
                {task.deadline || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
