import React from 'react';
import './styles/global.css';
import LeftPanel from './components/auth/LeftPanel.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ProfilePage from './pages/global/ProfilePage.jsx';
import ProfileUpdate from './pages/global/ProfileUpdate.jsx';

import Backlog from './pages/project/Backlog.jsx';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/profile" element={<ProfilePage />} />
<<<<<<< HEAD
        <Route path="/ProfileUpdate" element={<ProfileUpdate />} />
=======

        <Route path="/backlog" element={<Backlog />} />

>>>>>>> 00bb465a18531e09ce17aa003eb78bfecb395af0
      </Routes>
    </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
