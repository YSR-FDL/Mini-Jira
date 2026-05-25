import React, { useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import Statistics from "../../components/profile/Statistics";
import About from "../../components/profile/About";
import Contributions from "../../components/profile/Contributions";
import Layout from "../../components/layout/Layout";
import s from "../../styles/Profile/Profile.module.css";

export default function ProfilePage() {

  return (
      <Layout activeNav="profile" pageTitle="Page profil">
          <div className={s.pageContent}>
            <ProfileHeader />
            
            <div className={s.profileBody}>
              <Statistics />
              <div className={s.bottomColumns}>
                <About />
                <Contributions />
              </div>
            </div>
            {/* Danger zone */}
            <div className={s.dangerZone}>
              <p className={s.dangerTitle}>Actions du compte</p>
              <p className={s.dangerText}>La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
              <button className={s.btnDanger}>Supprimer le compte</button>
            </div>
          </div>
      </Layout>
  );
}
