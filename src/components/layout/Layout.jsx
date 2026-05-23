import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

import s from "../../styles/Profile.module.css";

export default function Layout({ children, activeNav, pageTitle }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar activeNav={activeNav} collapsed={collapsed}
                    onToggle={() => setCollapsed((v) => !v)}/>

            <div className={`${s.mainArea} ${collapsed ? s.sidebarCollapsed : ""}`}>
                <TopBar pageTitle={pageTitle} />
                {children}
            </div>
        </div>
    );
}