import React from "react";
import { FolderKanban, CheckSquare, CheckCircle, Clock, Users, UsersRound } from "lucide-react";

const CARDS = [
  {
    key: "totalProjects",
    label: "Total Projets",
    icon: FolderKanban,
    iconBg: "rgba(0, 82, 204, 0.10)",
    iconColor: "var(--blue)",
  },
  {
    key: "totalTasks",
    label: "Total Tâches",
    icon: CheckSquare,
    iconBg: "rgba(0, 82, 204, 0.10)",
    iconColor: "var(--blue)",
  },
  {
    key: "completedTasks",
    label: "Tâches Terminees",
    icon: CheckCircle,
    iconBg: "rgba(0, 135, 90, 0.10)",
    iconColor: "var(--green)",
  },
  {
    key: "inProgressTasks",
    label: "En Cours",
    icon: Clock,
    iconBg: "rgba(255, 139, 0, 0.10)",
    iconColor: "#FF8B00",
  },
  {
    key: "totalUsers",
    label: "Utilisateurs",
    icon: Users,
    iconBg: "rgba(101, 84, 192, 0.10)",
    iconColor: "#6554C0",
  },
  {
    key: "totalTeams",
    label: "Équipes",
    icon: UsersRound,
    iconBg: "rgba(0, 135, 90, 0.10)",
    iconColor: "var(--green)",
  },
];

function computeTrend(key, stats) {
  const total = stats.totalTasks || 0;
  if (total === 0) return { text: "—", type: "neutral" };

  switch (key) {
    case "totalProjects":
      return { text: `${stats.totalProjects || 0} projet${(stats.totalProjects || 0) > 1 ? "s" : ""}`, type: "neutral" };
    case "totalTasks":
      return { text: `${total} au total`, type: "neutral" };
    case "completedTasks": {
      const pct = Math.round(((stats.completedTasks || 0) / total) * 100);
      return { text: `${pct}% achevé`, type: pct > 50 ? "up" : "neutral" };
    }
    case "inProgressTasks": {
      const val = stats.inProgressTasks || 0;
      return { text: val > 0 ? "Actif" : "Aucun", type: val > 0 ? "up" : "neutral" };
    }
    case "totalUsers":
      return { text: `${stats.totalUsers || 0} actif${(stats.totalUsers || 0) > 1 ? "s" : ""}`, type: "neutral" };
    case "totalTeams":
      return { text: `${stats.totalTeams || 0} équipe${(stats.totalTeams || 0) > 1 ? "s" : ""}`, type: "neutral" };
    default:
      return { text: "—", type: "neutral" };
  }
}

export default function StatsCards({ stats = {} }) {
  return (
    <div className="statsGrid">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const trend = computeTrend(card.key, stats);
        return (
          <div
            className="statCard"
            key={card.key}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="statCardTop">
              <div
                className="statIconWrap"
                style={{ background: card.iconBg }}
              >
                <Icon size={18} color={card.iconColor} strokeWidth={2} />
              </div>
              <span
                className={`statTrend ${trend.type === "neutral" ? "statTrendNeutral" : "statTrendUp"}`}
              >
                {trend.text}
              </span>
            </div>
            <div>
              <div className="statLabel">{card.label}</div>
              <div className="statValue">{stats[card.key] !== undefined ? stats[card.key] : 0}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
