import { useState } from "react";

import Layout from "../../components/layout/Layout";
import styles from "../../styles/ProfileUpdate.module.css";

const ROLES = [ "Designer", "Développeur", "Testeur", "Scrum Master", "Product Owner", "Autre"];

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ProfileUpdate() {
  const [firstName, setFirstName] = useState("Khalid");
  const [lastName, setLastName] = useState("Lamachi");
  const [email, setEmail] = useState("Khalidlamachi2005@gmail.com");
  const [selectedRoles, setSelectedRoles] = useState(["Développeur"]);
  const [profileErrors, setProfileErrors] = useState({});

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passErrors, setPassErrors] = useState({});

  // Toast
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {setToast("");}, 2800);
  };

  // Toggle role
  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Save profile
  const handleSaveProfile = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Prénom requis";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Nom requis";
    }

    if (!email.trim()) {
      newErrors.email = "E-mail requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail invalide";
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    if (
      firstName === "Khalid" &&
      lastName === "Lamachi" &&
      email === "Khalidlamachi2005@gmail.com" &&
      JSON.stringify(selectedRoles) === JSON.stringify(["Développeur"])
    ) {
      showToast("Aucune modification détectée");
      return;
    }

    setProfileErrors({});
    
    showToast("Modifications enregistrées");
  };

  // Update password
  const handleUpdatePassword = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Mot de passe actuel requis";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "Nouveau mot de passe requis";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Minimum 8 caractères";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(newErrors).length > 0) {
      setPassErrors(newErrors);
      return;
    }

    setPassErrors({});
    setCurrentPassword("")
    setNewPassword("");
    setConfirmPassword("");

    showToast("Mot de passe mis à jour");
  };

  // Cancel
  const handleCancel = () => {
    setFirstName("Khalid");
    setLastName("Lamachi");
    setEmail("Khalidlamachi2005@gmail.com");

    setSelectedRoles(["Développeur"]);

    setProfileErrors({});
  };

  return (
    <Layout activeNav="profile" pageTitle="Modification du profil">
      <div className={styles.pageWrapper}>
        <div className={styles.breadcrumb}> Modifications des informations du compte </div>

        <div className={styles.content}>
          {/* LEFT CARD */}
          <div className={`${styles.card} ${styles.mainCard}`}>
            <div className={styles.cardHeader}>
              <h1 className={styles.cardTitle}>Paramètres du profil</h1>
              <p className={styles.cardSubtitle}> Gérez vos informations personnelles, préférences et sécurité du compte.</p>
            </div>

            <div className={styles.cardBody}>
              {/* First name */}
              <div className={styles.formGroup}>
                <label className={styles.label}> Prénom </label>

                <input className={`${styles.input} ${profileErrors.firstName ? styles.hasError : ""}`} type="text" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}/>

                {profileErrors.firstName && (
                  <p className={styles.errorMsg}>{profileErrors.firstName}</p> )}
              </div>

              {/* Last name */}
              <div className={styles.formGroup}>
                <label className={styles.label}> Nom </label>
                <input className={`${styles.input} ${ profileErrors.lastName ? styles.hasError : "" }`} type="text" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}/>

                {profileErrors.lastName && (
                  <p className={styles.errorMsg}> {profileErrors.lastName}</p>)}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.label}> E-mail </label>

                <input className={`${styles.input} ${ profileErrors.email ? styles.hasError : "" }`} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value) }/>

                {profileErrors.email && (
                  <p className={styles.errorMsg}> {profileErrors.email}</p>)}
              </div>

              {/* Roles */}
              <div style={{ marginTop: "8px" }}>
                <p className={styles.rolesTitle}> Préférences et rôles </p>

                <div className={styles.rolesGrid}>
                  {ROLES.map((role) => {
                    const isChecked = selectedRoles.includes(role);

                    return (
                      <div key={role} className={`${styles.roleLabel} ${isChecked?styles.checked : ""}`} onClick={() => toggleRole(role)}>
                        <span className={styles.roleCheckbox}>
                          <CheckIcon />
                        </span>
                        {role}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button className={styles.btnSecondary} onClick={handleCancel}>Annuler</button>
              <button className={styles.btnPrimary} onClick={handleSaveProfile}>Enregistrer les modifications</button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className={`${styles.card} ${styles.securityCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle} style={{ fontSize: "16px" }}>Sécurité du compte</h2>
            </div>
            <div className={styles.cardBody}>
              {/* Current password */}
              <div className={styles.formGroup}>
                <label className={styles.label}> Mot de passe actuel </label>

                <div className={styles.passInput}>
                  <input className={`${styles.input} ${passErrors.currentPassword ? styles.hasError : ""}`}
                    type={showCurrent ? "text" : "password"} value={currentPassword} placeholder="Mot de passe actuel"
                    onChange={(e) => setCurrentPassword( e.target.value )}/>

                  <button className={styles.eyeBtn} onClick={() => setShowCurrent((v) => !v) }>
                    <EyeIcon open={showCurrent} />
                  </button>
                </div>

                {passErrors.currentPassword && (
                  <p className={styles.errorMsg}> {passErrors.currentPassword} </p>)}
              </div>

              {/* New password */}
              <div className={styles.formGroup}>
                <label className={styles.label}> Nouveau mot de passe </label>

                <div className={styles.passInput}>
                  <input className={`${styles.input} ${ passErrors.newPassword ? styles.hasError : ""}`}
                    type={showNew ? "text" : "password"} placeholder="Minimum 8 caractères"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>

                  <button className={styles.eyeBtn} onClick={() => setShowNew((v) => !v)}>
                    <EyeIcon open={showNew} />
                  </button>
                </div>

                {passErrors.newPassword && (
                  <p className={styles.errorMsg}> {passErrors.newPassword}</p>)}
              </div>

              {/* Confirm password */}
              <div className={styles.formGroup}>
                <label className={styles.label}> Confirmer le nouveau mot de passe </label>

                <div className={styles.passInput}>
                  <input className={`${styles.input} ${ passErrors.confirmPassword ? styles.hasError : "" }`}
                    type={ showConfirm ? "text" : "password" } placeholder="Confirmez votre mot de passe" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}/>

                  <button className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>

                {passErrors.confirmPassword && (
                  <p className={styles.errorMsg}> {passErrors.confirmPassword} </p> )}
              </div>

              <button className={styles.btnUpdatePass} onClick={handleUpdatePassword}> Mettre à jour le mot de passe </button>
            </div>
          </div>
        </div>
        {/* Danger zone */}
            <div className={styles.dangerZone}>
              <p className={styles.dangerTitle}>Actions du compte</p>
              <p className={styles.dangerText}>La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
              <button className={styles.btnDanger}>Supprimer le compte</button>
            </div>
        {toast && ( <div className={`${styles.toast} ${toast === "Aucune modification détectée" ? styles.toastError : "" }`}>{toast}</div>)}
      </div>
    </Layout>
  );
}