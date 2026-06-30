import React from "react";
import { Hash, Users, AtSign, User, Mail, Phone, Info, Calendar} from "lucide-react";
import s from "../../styles/Profile/Profile.module.css";

const rolesLabels = {
  scrum: "Scrum Master",
  po: "Product Owner",
  dev: "Développeur",
  designer: "Designer",
  tester: "Testeur"
}

const ROWS = [
  /*{ Icon: GraduationCap, value: (p) => p.status},*/
  { Icon: Hash, value: (p) => p.id},
  { Icon: User,value: (p) => `${p.nom || ''} ${p.prenom || ''}`},
  { Icon: AtSign, value: (p) => p.login},
  { Icon: Calendar, value: (p) => p.date_creation_compte || "Non défini"},
  { Icon: Mail, value: (p) => p.email},
  {
    Icon: Users,
    value: (p) => (<div> {p.experiences?.map((role, index) => ( <div key={index}>{rolesLabels[role] || role}</div> ))} 
      {(!p.experiences || p.experiences.length === 0) && "Aucun rôle"}
      {p.type_utilisateur === "ADMIN" && <div style={{marginTop: 5, fontSize: "0.85em", background: "#f59e0b", color: "white", padding: "2px 6px", borderRadius: "4px", display: "inline-block"}}>Admin</div>}
    </div>)
  }
];

export default function About({user}) {
  return (
    <div className={s.aboutCard}>
      <div className={s.aboutTitle}>
        <div className={s.aboutTitleIcon}><Info size={13} /></div>
        About
      </div>
      {ROWS.map(({ Icon, value }, i) => (
        <div key={i} className={s.aboutRow}>
          <span className={s.aboutIcon}><Icon size={14} strokeWidth={1.8} /></span>
          <span>{value(user)}</span>
        </div>
      ))}
    </div>
  );
}
