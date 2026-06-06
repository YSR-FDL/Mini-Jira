import { useState } from "react";
import Layout from "../../components/layout/Layout";
import styles from "../../styles/Profile/ProfileUpdate.module.css";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";

const rolesLabels = { scrum: "Scrum Master", po: "Product Owner", dev: "Développeur", designer: "Designer", tester: "Testeur"};
const ROLES = ["scrum", "dev", "tester", "designer", "po"];

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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  // PROFILE STATE
  const [firstName, setFirstName] = useState(user.prenom);
  const [lastName, setLastName] = useState(user.nom);
  const [email, setEmail] = useState(user.email);
  const [selectedRoles, setSelectedRoles] = useState( user.experiences);

  const [profileErrors, setProfileErrors] = useState({});

  // PASSWORD STATE
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passErrors, setPassErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // TOAST
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {setToast("");}, 2800);
  };

  // TOGGLE ROLE
  const toggleRole = (role) => {
    setSelectedRoles((prev) =>prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  // SAVE PROFILE
  const handleSaveProfile = async () => {
    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "Prénom requis";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Nom requis";
    }
    if (!email.trim()) {
      newErrors.email = "E-mail requis";
    }
    else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail invalide";
    }
    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }
    if (firstName === user.prenom && lastName === user.nom && email === user.email && JSON.stringify(selectedRoles) === JSON.stringify(user.experiences)) {
      showToast("Aucune modification détectée");
      return;
    }
    setProfileErrors({});

    try {
      const response = await axios.post(
        "http://localhost:8080/UpdateUser",
        {
          id: user.id,
          nom: lastName,
          prenom: firstName,
          email: email,
          experiences: selectedRoles,
          type_utilisateur: user.type_utilisateur
        }
      );
      console.log(response.data);
      localStorage.setItem("user",JSON.stringify(response.data));
      navigate("/ProfileUpdate", {
        replace: true
      });
      showToast("Modifications enregaistrées");
    }
    catch(error) {
      console.error(error);
      showToast("Erreur lors de la modification des informations");
    }
  };

  // UPDATE PASSWORD
const handleUpdatePassword = async () => {
  const newErrors = {};
  if (!currentPassword.trim()) {
    newErrors.currentPassword = "Mot de passe actuel requis";
  } else if(currentPassword !== user.password) {
    showToast("Mot de passe actuel incorrect");
    return;
  }
  if (!newPassword.trim()) {
    newErrors.newPassword = "Nouveau mot de passe requis";
  }
  else if (newPassword.length < 6) {
    newErrors.newPassword = "Minimum 6 caractères";
  }
  if (!confirmPassword.trim()) {
    newErrors.confirmPassword = "Confirmation requise";
  }
  else if (confirmPassword !== newPassword) {
    newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
  }
  if (Object.keys(newErrors).length > 0) {
    setPassErrors(newErrors);
    return;
  }
  setPassErrors({});
  console.log(user.id);
  console.log(newPassword);
  try {
    const response = await axios.post(
      "http://localhost:8080/UpdatePassword",
      {
        id: user.id,
        password : newPassword
      }
    );
    console.log(response.data);
    navigate("/ProfileUpdate", {
      replace: true,
      state: {
        user: response.data
      }
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Mot de passe mis à jour");
  }
  catch(error) {
    console.error(error);
    showToast("Erreur lors de la modification du mot de passe");
  }
};

  // CANCEL
  const handleCancel = () => {
    setFirstName(user.prenom);
    setLastName(user.nom);
    setEmail(user.email);
    setSelectedRoles(user.experiences);
    setProfileErrors({});
  };

  const handleDeleteAccount = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/DeleteAccount",
      {
        id: user.id
      }
    );
    console.log(response.data);
    navigate("/login", {
      state: {
        accountDeleted: true
      }
    });
  }
  catch(error) {
    console.error(error);
    showToast("Erreur lors de la suppression du compte");
  }
};

  return (
    <Layout activeNav="profile" pageTitle="Modification du profil">
      <div className={styles.breadcrumb}>
        <button className={styles.backBtn} onClick={() => navigate("/profile", { state: { user: user } })}>
          <ChevronLeft size={15} />Profil
        </button>

        <span className={styles.breadcrumbSep}>/</span>

        <span className={styles.breadcrumbCurrent}> Modification du profil </span>
      </div>
      <div className={styles.pageWrapper}>
        <div className={styles.breadcrumb}> Modifications des informations du compte</div>

        <div className={styles.content}>
          {/* LEFT CARD */}
          <div className={`${styles.card} ${styles.mainCard}`}>
            <div className={styles.cardHeader}>
              <h1 className={styles.cardTitle}> Paramètres du profil</h1>

              <p className={styles.cardSubtitle}> Gérez vos informations personnelles, préférences et sécurité du compte.</p>
            </div>

            <div className={styles.cardBody}>
              {/* FIRST NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Prénom</label>
                <input className={`${styles.input} ${profileErrors.firstName ? styles.hasError : ""}`} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                {profileErrors.firstName && ( <p className={styles.errorMsg}> {profileErrors.firstName} </p>)}
              </div>

              {/* LAST NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom</label>

                <input className={`${styles.input} ${profileErrors.lastName ? styles.hasError : ""}`} type="text"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}/>

                {profileErrors.lastName && ( <p className={styles.errorMsg}> {profileErrors.lastName} </p>)}
              </div>

              {/* EMAIL */}
              <div className={styles.formGroup}>
                <label className={styles.label}>E-mail</label>
                <input className={`${styles.input} ${profileErrors.email ? styles.hasError : ""}`} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}/>

                {profileErrors.email && ( <p className={styles.errorMsg}>{profileErrors.email}</p>)}
              </div>

              {/* ROLES */}
              <div style={{ marginTop: "8px" }}>
                <p className={styles.rolesTitle}>Expériences</p>

                <div className={styles.rolesGrid}>
                  {ROLES.map((role) => {
                    const isChecked = selectedRoles.includes(role);
                    return (
                      <div key={role} className={`${styles.roleLabel} ${isChecked ? styles.checked : ""}`} onClick={() => toggleRole(role)}>
                        <span className={styles.roleCheckbox}><CheckIcon /></span>
                        {rolesLabels[role]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FOOTER */}
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
              {/* CURRENT PASSWORD */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Mot de passe actuel</label>
                <div className={styles.passInput}>
                  <input className={`${styles.input} ${passErrors.currentPassword ? styles.hasError : ""}`}
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword} placeholder="Mot de passe actuel" onChange={(e) => setCurrentPassword(e.target.value)}/>
                  <button className={styles.eyeBtn} onClick={() => setShowCurrent((v) => !v)}><EyeIcon open={showCurrent} /></button>
                </div>

                {passErrors.currentPassword && (<p className={styles.errorMsg}>{passErrors.currentPassword}</p>)}
              </div>

              {/* NEW PASSWORD */}
              <div className={styles.formGroup}><label className={styles.label}> Nouveau mot de passe </label>

                <div className={styles.passInput}>
                  <input className={`${styles.input} ${passErrors.newPassword ? styles.hasError : ""}`} type={showNew ? "text" : "password"}
                    placeholder="Minimum 8 caractères" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                  <button className={styles.eyeBtn} onClick={() => setShowNew((v) => !v)}><EyeIcon open={showNew} /></button>
                </div>
                {passErrors.newPassword && (<p className={styles.errorMsg}>{passErrors.newPassword}</p>)}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirmer le nouveau mot de passe</label>
                <div className={styles.passInput}>
                  <input className={`${styles.input} ${passErrors.confirmPassword ? styles.hasError : ""}`}
                    type={showConfirm ? "text" : "password"} placeholder="Confirmez votre mot de passe"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>

                  <button className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {passErrors.confirmPassword && (<p className={styles.errorMsg}>{passErrors.confirmPassword}</p>)}
              </div>
              <button className={styles.btnUpdatePass} onClick={handleUpdatePassword}>Mettre à jour le mot de passe</button>
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className={styles.dangerZone}>
          <p className={styles.dangerTitle}>Actions du compte</p>
          <p className={styles.dangerText}>La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
          <button className={styles.btnDanger} onClick={() => setShowDeleteConfirm(true)}>Supprimer le compte</button>
        </div>

        {toast && (
          <div className={`${styles.toast} ${toast === "Aucune modification détectée" || toast === "Erreur lors de la modification des informations" 
          || toast === "Mot de passe actuel incorrect" || toast === "Erreur lors de la modification du mot de passe"
          || toast === "Erreur lors de la suppression du compte" ? styles.toastError : ""}`}>
            {toast}
          </div>
        )}

        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.deleteModal}>
              <h3>Confirmer la suppression</h3>
              <p> Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}> Annuler </button>
                <button className={styles.deleteBtn} onClick={async () => { setShowDeleteConfirm(false); await handleDeleteAccount();}}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}