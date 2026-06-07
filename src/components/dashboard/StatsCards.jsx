import React from "react";
import { FolderKanban, CheckSquare, CheckCircle, Clock, Users, UsersRound } from "lucide-react";
import { dashboardStats } from "../../data/dashboardMockData";

const CARDS = [
  {
    key: "totalProjects",
    label: "Total Projets",
    icon: FolderKanban,
    iconBg: "rgba(0, 82, 204, 0.10)",
    iconColor: "var(--blue)",
    trend: "+2 ce mois",
    trendUp: true,
  },
  {
    key: "totalTasks",
    label: "Total Tâches",
    icon: CheckSquare,
    iconBg: "rgba(0, 82, 204, 0.10)",
    iconColor: "var(--blue)",
    trend: "+12 ce mois",
    trendUp: true,
  },
  {
    key: "completedTasks",
    label: "Tâches Terminées",
    icon: CheckCircle,
    iconBg: "rgba(0, 135, 90, 0.10)",
    iconColor: "var(--green)",
    trend: "+8 ce mois",
    trendUp: true,
  },
  {
    key: "inProgressTasks",
    label: "En Cours",
    icon: Clock,
    iconBg: "rgba(255, 139, 0, 0.10)",
    iconColor: "#FF8B00",
    trend: "Actif",
    trendUp: null,
  },
  {
    key: "totalUsers",
    label: "Utilisateurs",
    icon: Users,
    iconBg: "rgba(101, 84, 192, 0.10)",
    iconColor: "#6554C0",
    trend: "+3 ce mois",
    trendUp: true,
  },
  {
    key: "totalTeams",
    label: "Équipes",
    icon: UsersRound,
    iconBg: "rgba(0, 135, 90, 0.10)",
    iconColor: "var(--green)",
    trend: "Stable",
    trendUp: null,
  },
];

export default function StatsCards() {
  return (
    <div className="statsGrid">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
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
                className={`statTrend ${card.trendUp === null ? "statTrendNeutral" : "statTrendUp"}`}
              >
                {card.trend}
              </span>
            </div>
            <div>
              <div className="statLabel">{card.label}</div>
              <div className="statValue">{dashboardStats[card.key]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
