import React from "react";
import { GraduationCap, Users, Building2, MapPin, Mail, Phone, Info } from "lucide-react";
import { userProfile } from "../../data/mockData";
import s from "../../styles/Profile/Profile.module.css";

const ROWS = [
  /*{ Icon: GraduationCap, value: (p) => p.status},
  { Icon: Users, value: (p) => p.department},
  { Icon: Building2, value: (p) => p.university},
  { Icon: MapPin, value: (p) => p.location},*/
  { Icon: Mail, value: (p) => p.email},
  //{ Icon: Phone, value: (p) => p.phone},
];

export default function About() {
  return (
    <div className={s.aboutCard}>
      <div className={s.aboutTitle}>
        <div className={s.aboutTitleIcon}><Info size={13} /></div>
        About
      </div>
      {ROWS.map(({ Icon, value }, i) => (
        <div key={i} className={s.aboutRow}>
          <span className={s.aboutIcon}><Icon size={14} strokeWidth={1.8} /></span>
          <span>{value(userProfile)}</span>
        </div>
      ))}
    </div>
  );
}
