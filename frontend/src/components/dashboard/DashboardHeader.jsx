import React from "react";
import { RefreshCw } from "lucide-react";
import s from "../../styles/Dashboard/dashboard.css";

export default function DashboardHeader() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const dateStr = now.toLocaleDateString("fr-FR", options);

  const user = JSON.parse(localStorage.getItem("user"));
  const prenom = user?.prenom || "Utilisateur";

  return (
    <div className="dashHeader">
      <div className="dashHeaderLeft">
        <h1>Bonjour, {prenom}</h1>
        <p>Voici un aperçu complet de votre activité et de vos projets.</p>
      </div>
      <div className="dashHeaderRight">
        <span className="dashDate">{dateStr}</span>
        <button className="dashRefreshBtn" onClick={() => window.location.reload()}>
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>
    </div>
  );
}
