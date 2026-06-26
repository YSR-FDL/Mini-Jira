import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../../services/projectService";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart2,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  IdCard,
} from "lucide-react";
import s from "../../styles/Layout/Sidebar.module.css";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "projets", label: "Projets", icon: "projects" },
  { id: "tâches", label: "Tâches", icon: "tasks" },
  { id: "équipes", label: "Équipes", icon: "teams" },
  { id: "reports", label: "Bug Reports", icon: "reports" },
  { id: "paramètres", label: "Paramètres", icon: "settings" },
  { id: "profile", label: "Profil", icon: "profile" },
  { id: "users", label: "Gestion des utilisateurs", icon: "users" },
];

const ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  tasks: CheckSquare,
  teams: Users,
  reports: BarChart2,
  settings: Settings,
  profile: UserCircle,
  users: IdCard,
};

export default function Sidebar({ activeNav, collapsed, onToggle }) {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.type_utilisateur === "ADMIN";

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
          console.error("Error checking settings access in sidebar:", err);
        }
      }
    };
    checkSettingsAccess();
  }, []);

  const handleClick = (id) => {
    if (id === "profile") navigate("/profile");
    if (id === "projets") navigate("/projects");
    if (id === "équipes") navigate("/teams");
    if (id === "tâches") navigate("/tasks");
    if (id === "users") navigate("/users");
    if (id === "dashboard") navigate("/dashboard");
    if (id === "paramètres") navigate("/settings");
    if (id === "reports") navigate("/reports");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (isAdmin) {
      return (
        item.id === "users" ||
        item.id === "profile" ||
        item.id === "équipes" ||
        item.id === "projets"
      );
    }

    if (item.id === "paramètres") {
      return showSettings;
    }

    if (item.id === "users") {
      return false;
    }

    return true;
  });

  return (
    <aside className={`${s.sidebar}${collapsed ? " " + s.collapsed : ""}`}>
      <div className={s.brand}>
        {!collapsed && (
          <div className={s.brandLeft}>
            <div className={s.brandText}>
              <div className={s.brandName}>MiniJira</div>
              <div className={s.brandSub}>Management Agile</div>
            </div>
          </div>
        )}

        <button
          className={s.toggleBtn}
          onClick={onToggle}
          title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <nav className={s.nav}>
        {filteredNavItems.map((item) => {
          const Icon = ICONS[item.icon] || UserCircle;
          return (
            <button
              key={item.id}
              className={`${s.navItem}${activeNav === item.id ? " " + s.active : ""}`}
              onClick={() => handleClick(item.id)}
              data-tooltip={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span className={s.navIcon}>
                <Icon
                  size={17}
                  strokeWidth={activeNav === item.id ? 2.2 : 1.8}
                />
              </span>
              <span className={s.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={s.footer}>
        <button
          className={`${s.navItem} ${s.logoutBtn}`}
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
          data-tooltip={collapsed ? "Déconnexion" : undefined}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <span className={s.navIcon}>
            <LogOut size={17} strokeWidth={1.8} />
          </span>
          <span className={s.navLabel}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
