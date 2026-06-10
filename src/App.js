import React from "react";
import "./styles/global.css";
import LeftPanel from "./components/auth/LeftPanel.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ProfilePage from "./pages/global/ProfilePage.jsx";
import ProfileUpdate from "./pages/global/ProfileUpdate.jsx";
import Backlog from "./pages/project/Backlog.jsx";
import Board from "./pages/project/Board.jsx";
import Settings from "./pages/project/Settings.jsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TeamsPage from "./pages/global/TeamsPage.jsx";
import ProjectsPage from "./pages/global/ProjectsPage.jsx";
import Overview from "./pages/project/Overview.jsx";
import ProjectReports from "./pages/project/Reports.jsx";
import Epics from "./pages/project/Epics.jsx";
import TeamDetailsPage from './pages/global/TeamDetailsPage.jsx'
import TasksPage from "./pages/global/TasksPage.jsx"
import ReportsPage from "./pages/global/ReportsPage.jsx"
import UsersPage from "./pages/global/UsersPage.jsx";
import DashboardPage from "./pages/global/DashboardPage.jsx"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ProfileUpdate" element={<ProfileUpdate />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/overview/:id" element={<Overview />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/board" element={<Board />} />
            <Route path="/epics" element={<Epics />} />
            <Route path="/sprints" element={<Navigate to="/backlog" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage/>} />
            <Route path="/detailsTeam/:id" element={<TeamDetailsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/project-reports" element={<ProjectReports />} />
            <Route path="/users" element={<UsersPage/>} />
            <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
