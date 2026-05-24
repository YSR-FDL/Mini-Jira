import React from "react";
import Layout from "./Layout";
import ProjectNavigation from "./ProjectNavigation";
import ProjectHeader from "./ProjectHeader";
import s from "../../styles/Profile.module.css";

export default function ProjectLayout({
  children,
  activeTab,
  onTabChange,
  projectName,
}) {
  return (
    <Layout activeNav="projets" pageTitle={projectName}>
      <div
        className={s.pageContent}
        style={{
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
        }}
      >
        {/* HEADER DU PROJET PERSISTANT */}
        <ProjectHeader />

        {/* NAVIGATION DU PROJET */}
        <div style={{ flexShrink: 0, marginBottom: "24px" }}>
          <ProjectNavigation activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* CONTENU DE LA PAGE (ex: Backlog, Board...) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </Layout>
  );
}
