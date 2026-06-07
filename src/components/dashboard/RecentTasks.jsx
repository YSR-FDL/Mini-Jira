import React from "react";
import { CheckSquare } from "lucide-react";
import { recentTasks } from "../../data/dashboardMockData";

function PriorityBadge({ priority }) {
  const map = {
    LOW: { label: "Low", cls: "badge badgeLow" },
    MEDIUM: { label: "Medium", cls: "badge badgeMedium" },
    HIGH: { label: "High", cls: "badge badgeHigh" },
    CRITICAL: { label: "Critical", cls: "badge badgeCritical" },
  };
  const { label, cls } = map[priority] || map["LOW"];
  return <span className={cls}>{label}</span>;
}

function StatusBadge({ status }) {
  const map = {
    "À FAIRE": { label: "À Faire", cls: "badge badgeTodo" },
    "EN COURS": { label: "En Cours", cls: "badge badgeInProgress" },
    TERMINÉ: { label: "Terminé", cls: "badge badgeDone" },
  };
  const { label, cls } = map[status] || map["À FAIRE"];
  return <span className={cls}>{label}</span>;
}

export default function RecentTasks() {
  return (
    <div className="card">
      <div className="cardHeader">
        <span className="cardTitle">
          <CheckSquare size={15} />
          Mes Tâches Récentes
        </span>
        <button className="cardAction">Voir tout</button>
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
                {task.deadline}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
