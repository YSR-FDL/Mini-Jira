import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {LayoutDashboard, FolderKanban, CheckSquare,Users, BarChart2, Settings, UserCircle,ChevronLeft, ChevronRight,} from "lucide-react";
import s from "../../styles/Layout/Sidebar.module.css";

export const navItems = [
  { id: "dashboard",   label: "Dashboard",  icon: "dashboard" },
  { id: "projets",     label: "Projets",    icon: "projects"  },
  { id: "tâches",      label: "Tâches",     icon: "tasks"     },
  { id: "équipes",     label: "Équipes",    icon: "teams"     },
  { id: "reports",     label: "Reports",    icon: "reports"   },
  { id: "paramètres",  label: "Paramètres", icon: "settings"  },
  { id: "profile",     label: "Profil",     icon: "profile"   },
];

const ICONS = {
  dashboard: LayoutDashboard,
  projects:  FolderKanban,
  tasks:     CheckSquare,
  teams:     Users,
  reports:   BarChart2,
  settings:  Settings,
  profile:   UserCircle,
};

export default function Sidebar({ activeNav, collapsed, onToggle }) {
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (id === "profile") navigate("/profile");
    if (id === "projets") navigate("/projects");
    if (id === "équipes") navigate("/teams");
    if (id === "tâches") navigate("/tasks");
  };

  return (
    <aside className={`${s.sidebar}${collapsed ? " " + s.collapsed : ""}`}>

      {/* ── Brand + toggle ── */}
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
        {navItems.map((item) => {
          const Icon = ICONS[item.icon] || UserCircle;
          return (
            <button key={item.id} className={`${s.navItem}${activeNav === item.id ? " " + s.active : ""}`}
              onClick={() => handleClick(item.id)} data-tooltip={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span className={s.navIcon}>
                <Icon size={17} strokeWidth={activeNav === item.id ? 2.2 : 1.8} />
              </span>
              <span className={s.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
