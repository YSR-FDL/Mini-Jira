import React from "react";
import "./styles/global.css";
import LeftPanel from "./components/auth/LeftPanel.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ProfilePage from "./pages/global/ProfilePage.jsx";
import ProfileUpdate from "./pages/global/ProfileUpdate.jsx";
import Backlog from "./pages/project/Backlog.jsx";
import Board from "./pages/project/Board.jsx";
import Sprints from "./pages/project/Sprints.jsx";
import Settings from "./pages/project/Settings.jsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeamsPage from "./pages/global/TeamsPage.jsx";
import ProjectsPage from "./pages/global/ProjectsPage.jsx";
import Overview from "./pages/project/Overview.jsx";
import TeamDetailsPage from './pages/global/TeamDetailsPage.jsx'

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ProfileUpdate" element={<ProfileUpdate />} />
          <Route path="/teams" element={<TeamsPage />} />
          
          {/* Project routes */}
          <Route path="/overview" element={<Overview />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/board" element={<Board />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/detailsTeam/:id" element={<TeamDetailsPage />} />
      </Routes>
    </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
