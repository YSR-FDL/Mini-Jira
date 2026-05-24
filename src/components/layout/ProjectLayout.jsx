import React from "react";
import Layout from "./Layout";
import ProjectNavigation from "./ProjectNavigation";
import s from "../../styles/Profile.module.css";

export default function ProjectLayout({ children, activeTab, onTabChange, projectName }) {
  return (
    <Layout activeNav="projets" pageTitle={projectName}>
      <div
        className={s.pageContent}
        style={{
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "500",
            color: "var(--color-text-primary)",
            marginBottom: "8px",
          }}
        >
          {projectName || "Projet"}
        </h1>

        {/* NAVIGATION DU PROJET */}
        <ProjectNavigation activeTab={activeTab} onTabChange={onTabChange} />

        {/* CONTENU DE LA PAGE (ex: Backlog, Board...) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </Layout>
  );
}
