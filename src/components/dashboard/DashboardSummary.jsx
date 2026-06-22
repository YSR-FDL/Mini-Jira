import React from "react";
import {
  TrendingUp,
  FolderKanban,
  Zap,
  AlertCircle,
  BarChart2,
} from "lucide-react";

const SUMMARY_ITEMS = [
  {
    key: "completionRate",
    label: "Taux d'Achèvement",
    icon: TrendingUp,
    iconBg: "rgba(0, 135, 90, 0.10)",
    iconColor: "var(--green)",
    suffix: "%",
  },
  {
    key: "activeProjects",
    label: "Projets Actifs",
    icon: FolderKanban,
    iconBg: "rgba(0, 82, 204, 0.10)",
    iconColor: "var(--blue)",
    suffix: "",
  },
  {
    key: "activeSprints",
    label: "Sprints Actifs",
    icon: Zap,
    iconBg: "rgba(101, 84, 192, 0.10)",
    iconColor: "#6554C0",
    suffix: "",
  },
  {
    key: "overdueTasks",
    label: "Tâches en Retard",
    icon: AlertCircle,
    iconBg: "rgba(201, 55, 44, 0.10)",
    iconColor: "var(--red)",
    suffix: "",
  },
];

export default function DashboardSummary({ globalSummary = {} }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="cardHeader">
        <span className="cardTitle">
          <BarChart2 size={15} />
          Résumé Global
        </span>
      </div>

      <div className="summaryGrid">
        {SUMMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div className="summaryItem" key={item.key}>
              <div
                className="summaryItemIcon"
                style={{ background: item.iconBg }}
              >
                <Icon size={17} color={item.iconColor} strokeWidth={2} />
              </div>
              <div className="summaryItemValue">
                {globalSummary[item.key]}{item.suffix}
              </div>
              <div className="summaryItemLabel">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
