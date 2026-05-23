import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/ProjectNavigation.css";

const ProjectNavigation = ({ activeTab, onTabChange }) => {
  const location = useLocation();

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
      {navItems.map((item) => {
        // Détermine si le lien est actif via la route ou le fallback activeTab
        const isActive = location.pathname === `/${item.id}` || activeTab === item.id;
        
        return (
          <Link
            key={item.id}
            to={`/${item.id}`}
            className={`nav-link ${isActive ? "active" : ""}`}
            onClick={() => {
              if (onTabChange) onTabChange(item.id);
            }}
          >
            <span className="nav-icon material-symbols-outlined">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* L'onglet Settings est mis à part pour appliquer la classe nav-settings (margin-left: auto) */}
      <Link
        to="/settings"
        className={`nav-link nav-settings ${location.pathname === "/settings" || activeTab === "settings" ? "active" : ""}`}
        onClick={() => {
          if (onTabChange) onTabChange("settings");
        }}
      >
        <span className="nav-icon material-symbols-outlined">settings</span>
        <span>Settings</span>
      </Link>
    </nav>
  );
};

export default ProjectNavigation;
