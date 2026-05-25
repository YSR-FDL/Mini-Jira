import React, { useState } from "react";
import { Search, Bell, HelpCircle, Settings } from "lucide-react";
import s from "../../styles/Profile/Profile.module.css";

export default function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className={s.topbar}>
      <div className={s.topbarSearch}>
        <span className={s.searchIcon}><Search size={14} /></span>
        <input type="text" placeholder="Rechercher des taches, projets, équipes..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className={s.topbarActions}>
        <button className={s.iconBtn} title="Aide"><HelpCircle size={17} /></button>
        <button className={s.iconBtn} title="Paramètres"><Settings size={17} /></button>
        <div className={s.topbarAvatar} title="Mon profil">KL</div>
      </div>
    </header>
  );
}
