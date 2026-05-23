import React from "react";
import "../../styles/ProjectNavigation.css";

const ProjectNavigation = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: "visibility" },
    { id: "backlog", label: "Backlog", icon: "list_alt" },
    { id: "board", label: "Board", icon: "dashboard" },
    { id: "sprints", label: "Sprints", icon: "sync" },
    { id: "epics", label: "Epics", icon: "mountain_flag" },
    { id: "reports", label: "Reports", icon: "bar_chart" },
    { id: "calendar", label: "Calendar", icon: "calendar_today" },
  ];

  return (
    <nav className="navigation-bar">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`} // En attendant d'utiliser React Router
          className={`nav-link ${activeTab === item.id ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault(); // Empêche le rechargement de la page
            onTabChange(item.id);
          }}
        >
          <span className="nav-icon material-symbols-outlined">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </a>
      ))}

      {/* L'onglet Settings est mis à part pour appliquer la classe nav-settings (margin-left: auto) */}
      <a
        href="#settings"
        className={`nav-link nav-settings ${activeTab === "settings" ? "active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange("settings");
        }}
      >
        <span className="nav-icon material-symbols-outlined">settings</span>
        <span>Settings</span>
      </a>
    </nav>
  );
};

export default ProjectNavigation;
