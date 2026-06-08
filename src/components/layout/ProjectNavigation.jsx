import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { projectService } from "../../services/projectService";
import "../../styles/Layout/ProjectNavigation.css";

const ProjectNavigation = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const checkSettingsAccess = async () => {
      const rawId = localStorage.getItem("selectedProjectId");
      const projectId =
        rawId && rawId !== "undefined" && rawId !== "null"
          ? parseInt(rawId, 10)
          : 1;
      const userString = localStorage.getItem("user");
      const loggedInUser = userString ? JSON.parse(userString) : null;

      if (projectId && loggedInUser) {
        try {
          const project = await projectService.getProjectById(projectId);
          if (project) {
            const currentUserId = parseInt(loggedInUser.id, 10);
            const isCreator = parseInt(project.idCreateur, 10) === currentUserId;
            const isSM = parseInt(project.idSM, 10) === currentUserId;
            setShowSettings(isCreator || isSM);
          }
        } catch (err) {
          console.error("Error checking settings access in nav:", err);
        }
      }
    };
    checkSettingsAccess();
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: "visibility" },
    { id: "backlog", label: "Backlog", icon: "list_alt" },
    { id: "board", label: "Board", icon: "dashboard" },
    { id: "epics", label: "Epics", icon: "mountain_flag" },
    { id: "reports", label: "Reports", icon: "bar_chart" },
    { id: "calendar", label: "Calendar", icon: "calendar_today" },
  ];

  return (
    <nav className="navigation-bar">
      {navItems.map((item) => {
        // Détermine si le lien est actif via la route ou le fallback activeTab
        const isActive =
          location.pathname === `/${item.id}` || activeTab === item.id;

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
      {showSettings && (
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
      )}
    </nav>
  );
};

export default ProjectNavigation;
