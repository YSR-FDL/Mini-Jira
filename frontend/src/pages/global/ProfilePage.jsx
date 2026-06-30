import React, { useEffect, useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import Statistics from "../../components/profile/Statistics";
import About from "../../components/profile/About";
import Contributions from "../../components/profile/Contributions";
import Layout from "../../components/layout/Layout";
import s from "../../styles/Profile/Profile.module.css";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate()
  const userFromStorage = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (userFromStorage?.id) {
      fetch(`http://localhost:8080/Backend_PFA/GetUserStats?idUser=${userFromStorage.id}`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Error fetching user stats:", err));
    }
  }, [userFromStorage?.id]);

  const user = { ...userFromStorage, ...stats };

  return (
      <Layout activeNav="profile" pageTitle="Page profil">
          <div className={s.pageContent}>
            <ProfileHeader user={user}/>
            
            <div className={s.profileBody}>
              <Statistics user={user} />
              <div className={s.bottomColumns}>
                <About user={user} />
                <Contributions user={user} />
              </div>
            </div>
          </div>
      </Layout>
  );
}
