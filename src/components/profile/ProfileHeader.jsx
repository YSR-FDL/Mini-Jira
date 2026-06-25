import React from "react";
import { UserCircle, Pencil } from "lucide-react";
import s from "../../styles/Profile/Profile.module.css";
import { useNavigate } from "react-router-dom";
const rolesLabels = {
  scrum: "Scrum Master",
  po: "Product Owner",
  dev: "Développeur",
  designer: "Designer",
  tester: "Testeur"
}

export default function ProfileHeader({user}) {
  const navigate = useNavigate();

  return (
    <>
      <div className={s.profileBanner} />

      <div className={s.profileHeaderWrap}>
        <div className={s.profileHeaderInner}>
          <div className={s.profileAvatarBox} title="Changer la photo">
            <UserCircle size={52} strokeWidth={1} color="var(--text-light)" />
          </div>

          <div className={s.profileInfo}>
            <div className={s.profileName}>{user.nom} {user.prenom}</div>
            <div className={s.profileRole}>
                {user.experiences.map((role, index) => (
                  <span key={index}>
                    {rolesLabels[role]}
                    {index < user.experiences.length - 1 && ", "}
                  </span>
                ))}
            </div>
          </div>

          <button className={s.editProfileBtn} onClick = {() => {navigate("/ProfileUpdate");}}>
            <Pencil size={14} /> Modifier mon Profil
          </button>
        </div>
      </div>
    </>
  );
}
