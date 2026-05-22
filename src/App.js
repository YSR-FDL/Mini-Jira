import React from 'react';
import './styles/global.css';
import LeftPanel from './components/auth/LeftPanel.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ProfilePage from './pages/global/ProfilePage.jsx';
import ProfileUpdate from './pages/global/ProfileUpdate.jsx';
import Backlog from './pages/project/Backlog.jsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TeamsPage from './pages/global/TeamsPage.jsx';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ProfileUpdate" element={<ProfileUpdate />} />
        <Route path="/teams" element={<TeamsPage/>} />
        <Route path="/backlog" element={<Backlog />} />

      </Routes>
    </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
