import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProfileHeader from "../components/ProfileHeader";
import Statistics from "../components/Statistics";
import About from "../components/About";
import Contributions from "../components/Contributions";
import s from "../styles/Profile.module.css";

export default function ProfilePage() {
  const [activeNav, setActiveNav]   = useState("profile");
  const [collapsed, setCollapsed]   = useState(false);

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav}
        collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)}
      />

      <div className={`${s.mainArea}${collapsed ? " " + s.sidebarCollapsed : ""}`}>
        <TopBar pageTitle="Page profil" />

        <div className={s.pageContent}>
          <ProfileHeader />
          
          <div className={s.profileBody}>
            <Statistics />
            <div className={s.bottomColumns}>
              <About />
              <Contributions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
